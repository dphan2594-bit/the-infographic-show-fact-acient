"""
Kurzgesagt-style flat explainer animation, built with Manim Community.

Palette (edit these four lines to re-theme the whole scene):
    BACKGROUND : deep space navy   #0E1117
    LEMON      : lemon yellow      #FCE38A
    TURQUOISE  : cyan / turquoise  #48CAE4
    CORAL      : coral pink        #F38181

Run (see bottom of file / README for full commands):
    manim -p --resolution 1920,1080 --fps 60 -qh scene.py KurzgesagtExplainer
"""

from manim import *
from manim.utils.rate_functions import ease_in_out_sine

# ---------------------------------------------------------------------------
# 1. Custom Kurzgesagt-inspired color palette
# ---------------------------------------------------------------------------
BACKGROUND = "#0E1117"
LEMON = "#FCE38A"
TURQUOISE = "#48CAE4"
CORAL = "#F38181"

ICON_COLORS = [LEMON, CORAL, TURQUOISE]


class KurzgesagtExplainer(Scene):
    def construct(self):
        self.camera.background_color = BACKGROUND

        # -------------------------------------------------------------
        # 2. Central "planet / asset" circle — flat fill + soft highlight
        # -------------------------------------------------------------
        core = Circle(radius=1.4, color=TURQUOISE, fill_opacity=1, stroke_width=0)
        highlight = Ellipse(width=0.9, height=0.5, fill_color=WHITE, fill_opacity=0.16, stroke_width=0)
        highlight.move_to(core.get_center() + UP * 0.42 + LEFT * 0.32)
        core_group = VGroup(core, highlight).move_to(ORIGIN)

        self.play(
            GrowFromCenter(core_group),
            rate_func=smooth,
            run_time=1.4,
        )

        # -------------------------------------------------------------
        # 3. Small icons (circles + stars) radiating around the core
        # -------------------------------------------------------------
        orbit_radius = 3.0
        n_icons = 8

        orbit_group = VGroup()
        for i in range(n_icons):
            angle = i * TAU / n_icons
            color = ICON_COLORS[i % len(ICON_COLORS)]

            if i % 3 == 0:
                icon = Star(
                    n=5,
                    outer_radius=0.22,
                    inner_radius=0.1,
                    color=color,
                    fill_opacity=1,
                    stroke_width=0,
                )
            else:
                icon = Circle(radius=0.16, color=color, fill_opacity=1, stroke_width=0)

            icon.move_to(orbit_radius * np.array([np.cos(angle), np.sin(angle), 0]))
            orbit_group.add(icon)

        self.play(
            LaggedStart(*[GrowFromCenter(icon) for icon in orbit_group], lag_ratio=0.08),
            rate_func=smooth,
            run_time=1.2,
        )

        # Smooth, continuous orbital sweep (ease in / out, no linear motion)
        self.play(
            Rotate(orbit_group, angle=TAU, about_point=ORIGIN),
            rate_func=ease_in_out_sine,
            run_time=4,
        )

        # -------------------------------------------------------------
        # 4. Shift the whole cluster left to make room for the chart
        # -------------------------------------------------------------
        scene_group = VGroup(core_group, orbit_group)
        self.play(
            scene_group.animate.scale(0.55).to_edge(LEFT, buff=1.2),
            rate_func=ease_in_out_sine,
            run_time=1.2,
        )

        # -------------------------------------------------------------
        # 5. Smooth growth chart — hand-built VMobject curve
        # -------------------------------------------------------------
        axes_origin = RIGHT * 1.0 + DOWN * 1.5

        baseline = Line(
            axes_origin,
            axes_origin + RIGHT * 5.5,
            color=WHITE,
            stroke_width=2,
            stroke_opacity=0.4,
        )

        data_points = [
            axes_origin + RIGHT * 0.0 + UP * 0.1,
            axes_origin + RIGHT * 1.1 + UP * 0.6,
            axes_origin + RIGHT * 2.2 + UP * 1.0,
            axes_origin + RIGHT * 3.3 + UP * 1.9,
            axes_origin + RIGHT * 4.4 + UP * 2.6,
            axes_origin + RIGHT * 5.5 + UP * 3.4,
        ]

        growth_curve = VMobject(color=LEMON, stroke_width=6)
        growth_curve.set_points_smoothly(data_points)

        growth_dot = Dot(data_points[0], color=CORAL, radius=0.09)

        self.play(Create(baseline), rate_func=smooth, run_time=0.6)
        self.play(
            Create(growth_curve),
            MoveAlongPath(growth_dot, growth_curve),
            rate_func=smooth,
            run_time=2.2,
        )

        # -------------------------------------------------------------
        # 6. Bold, rounded sans-serif title
        #    "Poppins" gives the rounded geometric look; if it is not
        #    installed on your system, swap it for another rounded
        #    sans (e.g. "Montserrat", "Quicksand", "DejaVu Sans").
        # -------------------------------------------------------------
        title = Text(
            "GROWING TOGETHER",
            font="Poppins",
            weight=BOLD,
            color=WHITE,
            font_size=56,
        )
        title.to_edge(UP, buff=0.6)

        subtitle = Text(
            "a flat, friendly way to explain big ideas",
            font="Poppins",
            weight=MEDIUM,
            color=TURQUOISE,
            font_size=28,
        )
        subtitle.next_to(title, DOWN, buff=0.25)

        self.play(FadeIn(title, shift=UP * 0.3), rate_func=ease_in_out_sine, run_time=1.0)
        self.play(FadeIn(subtitle, shift=UP * 0.2), rate_func=ease_in_out_sine, run_time=0.8)

        self.wait(1.5)

        # -------------------------------------------------------------
        # 7. Gentle closing breathe on the whole cluster
        # -------------------------------------------------------------
        self.play(scene_group.animate.scale(1.03), rate_func=ease_in_out_sine, run_time=1.0)
        self.play(scene_group.animate.scale(1 / 1.03), rate_func=ease_in_out_sine, run_time=1.0)

        self.wait(1)
