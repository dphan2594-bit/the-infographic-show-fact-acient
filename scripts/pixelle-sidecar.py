#!/usr/bin/env python3
"""Sidecar bổ sung route /api/media/generate cho Pixelle-Video.

Vì sao cần: bản Pixelle-Video gốc chỉ expose

  * POST /api/image/generate  — sinh 1 ẢNH, không nhận negative_prompt
  * POST /api/video/generate  — chạy TRỌN pipeline (script → ảnh → TTS → ghép)

Không có route nào sinh riêng MỘT clip video. Pipeline này chỉ mượn Pixelle ở
khâu sinh media rồi tự dựng bằng Remotion, nên cần đúng một lớp mỏng gọi thẳng
`core.media(...)` — thứ đã hỗ trợ sẵn media_type="video", negative_prompt và
duration nhưng chưa được HTTP hoá.

Sidecar chạy song song, KHÔNG sửa gì trong checkout Pixelle-Video.

Cách chạy — trong thư mục checkout Pixelle-Video (nơi có config.yaml):

    uv run python /đường/dẫn/tới/scripts/pixelle-sidecar.py
    # hoặc: python scripts/pixelle-sidecar.py --port 8765

Rồi trỏ cầu nối vào nó:

    node scripts/pixelle-media.mjs --api http://127.0.0.1:8765

Sidecar mount lại router /api/files của Pixelle nên tự phục vụ luôn file trong
output/ — chỉ cần một base URL duy nhất.
"""

import argparse
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Literal, Optional

try:
    import uvicorn
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field
except ImportError as exc:  # pragma: no cover - phụ thuộc môi trường Pixelle
    sys.exit(
        f"Thiếu dependency của Pixelle-Video ({exc}).\n"
        "Chạy script này bằng môi trường của Pixelle-Video, ví dụ:\n"
        "  cd /đường/dẫn/Pixelle-Video && uv run python /đường/dẫn/scripts/pixelle-sidecar.py"
    )


class MediaGenerateRequest(BaseModel):
    """Tham số sinh media — ánh xạ 1-1 sang MediaService.__call__."""

    prompt: str = Field(..., description="Prompt đã ghép sẵn phong cách")
    media_type: Literal["image", "video"] = Field("image")
    width: int = Field(1080, ge=512, le=2048)
    height: int = Field(1920, ge=512, le=2048)
    workflow: Optional[str] = Field(None, description="vd runninghub/image_flux.json")
    negative_prompt: Optional[str] = None
    duration: Optional[float] = Field(None, gt=0, description="Độ dài clip (giây), khớp audio TTS")
    seed: Optional[int] = None
    steps: Optional[int] = None


class MediaGenerateResponse(BaseModel):
    success: bool = True
    message: str = "Success"
    media_type: str
    media_path: str = Field(..., description="URL hoặc đường dẫn file media đã sinh")
    duration: Optional[float] = None


def build_app() -> Any:
    from api.routers.files import router as files_router
    from pixelle_video.service import PixelleVideoCore

    state: dict[str, Any] = {"core": None}

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        yield
        if state["core"] is not None:
            await state["core"].cleanup()
            state["core"] = None

    app = FastAPI(title="Pixelle-Video media sidecar", version="1.0.0", lifespan=lifespan)
    app.include_router(files_router, prefix="/api")

    async def get_core() -> Any:
        if state["core"] is None:
            core = PixelleVideoCore()
            await core.initialize()
            state["core"] = core
        return state["core"]

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "healthy", "service": "Pixelle-Video media sidecar"}

    @app.post("/api/media/generate", response_model=MediaGenerateResponse)
    async def media_generate(request: MediaGenerateRequest) -> MediaGenerateResponse:
        core = await get_core()
        params: dict[str, Any] = {
            "prompt": request.prompt,
            "media_type": request.media_type,
            "width": request.width,
            "height": request.height,
        }
        for field in ("workflow", "negative_prompt", "duration", "seed", "steps"):
            value = getattr(request, field)
            if value is not None:
                params[field] = value

        try:
            result = await core.media(**params)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

        return MediaGenerateResponse(
            media_type=result.media_type,
            media_path=result.url,
            duration=result.duration,
        )

    return app


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    if not Path("config.yaml").exists():
        print(
            "⚠ Không thấy config.yaml ở thư mục hiện tại.\n"
            "  Chạy script này TỪ TRONG checkout Pixelle-Video để nó đọc đúng cấu hình.",
            file=sys.stderr,
        )

    uvicorn.run(build_app(), host=args.host, port=args.port)


if __name__ == "__main__":
    main()
