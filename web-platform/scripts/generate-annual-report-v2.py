#!/usr/bin/env python3
"""
PICC Annual Report 2023-24 - World-Class PDF Generator (v2)

This generator creates a professionally designed PDF matching the official
PICC annual report aesthetic with:
- Custom wave patterns and decorative elements
- Circular photo frames with dotted arcs
- Hand-drawn style typography
- Full-bleed cover and back cover pages
- Professional charts and tables

Usage:
    python scripts/generate-annual-report-v2.py

Output:
    public/reports/picc-annual-report-2023-24.pdf
"""

import os
import math
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, inch
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Flowable, KeepTogether, Image
)
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Rect, Circle, Polygon, String, Line
from reportlab.graphics import renderPDF

# =============================================================================
# COLOR PALETTE (matching PICC brand)
# =============================================================================

class PICCColors:
    """PICC Brand Color Palette"""
    # Primary
    PURPLE = HexColor('#5B2D8E')
    LAVENDER = HexColor('#D4B8E8')
    BLUE = HexColor('#4A90B8')
    DARK_BLUE = HexColor('#3A5F8A')
    TEAL = HexColor('#5BA8B0')

    # Secondary
    PINK = HexColor('#E8A4C4')
    GREEN = HexColor('#6B9B7A')
    GOLD = HexColor('#D4A855')
    ORANGE = HexColor('#E07840')

    # Neutrals
    WHITE = HexColor('#FFFFFF')
    OFF_WHITE = HexColor('#F5F5F5')
    LIGHT_GRAY = HexColor('#E8E8E8')
    DARK_GRAY = HexColor('#333333')
    BLACK = HexColor('#1A1A1A')

    # Chart colors
    CHART_COLORS = [PINK, BLUE, PURPLE, TEAL, GREEN, ORANGE]

    # Gradient simulation colors for cover
    SKY_LIGHT = HexColor('#87CEEB')
    SKY_MID = HexColor('#6CB4D9')
    OCEAN = HexColor('#4A90B8')
    SAND = HexColor('#F5DEB3')

# =============================================================================
# PAGE DIMENSIONS
# =============================================================================

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_LEFT = 20 * mm
MARGIN_RIGHT = 20 * mm
MARGIN_TOP = 25 * mm
MARGIN_BOTTOM = 30 * mm
CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

# =============================================================================
# CUSTOM FLOWABLES
# =============================================================================

class WavePattern(Flowable):
    """Decorative wave pattern for page bottoms"""

    def __init__(self, width, height=80, colors=None, with_dots=True):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.colors = colors or [
            PICCColors.LAVENDER,
            PICCColors.BLUE,
            PICCColors.DARK_BLUE
        ]
        self.with_dots = with_dots

    def draw(self):
        canvas = self.canv
        h = self.height
        w = self.width

        # Draw three layered waves
        wave_heights = [h * 0.4, h * 0.65, h]

        for i, (color, wave_h) in enumerate(zip(self.colors, wave_heights)):
            canvas.setFillColor(color)

            # Create organic wave path
            path = canvas.beginPath()
            path.moveTo(0, 0)

            # Generate wave curve
            points = 20
            for j in range(points + 1):
                x = (j / points) * w
                # Organic wave with multiple frequencies
                y_base = wave_h * (0.6 + 0.2 * math.sin(j * 0.3 + i))
                y_wave = 8 * math.sin(x / 40 + i * 1.5)
                y = y_base + y_wave
                if j == 0:
                    path.lineTo(x, y)
                else:
                    # Smooth curve
                    path.lineTo(x, y)

            path.lineTo(w, 0)
            path.close()
            canvas.drawPath(path, fill=1, stroke=0)

            # Add dots
            if self.with_dots:
                canvas.setFillColor(white)
                import random
                random.seed(42 + i)  # Consistent randomness
                for _ in range(25):
                    dx = random.random() * w
                    dy = random.random() * (wave_h * 0.7)
                    r = random.uniform(2, 4)
                    canvas.circle(dx, dy, r, fill=1, stroke=0)

    def wrap(self, availWidth, availHeight):
        return (self.width, self.height)


class CircularPhotoFrame(Flowable):
    """Circular photo frame with decorative dotted arc"""

    def __init__(self, diameter=120, color=None, with_dots=True, label=None):
        Flowable.__init__(self)
        self.diameter = diameter
        self.color = color or PICCColors.BLUE
        self.with_dots = with_dots
        self.label = label

    def draw(self):
        canvas = self.canv
        r = self.diameter / 2
        cx, cy = r, r

        # Main circle (placeholder for photo)
        canvas.setFillColor(self.color)
        canvas.circle(cx, cy, r, fill=1, stroke=0)

        # White inner circle (photo area)
        canvas.setFillColor(white)
        canvas.circle(cx, cy, r - 4, fill=1, stroke=0)

        # Inner color ring
        canvas.setFillColor(self.color)
        canvas.circle(cx, cy, r - 8, fill=1, stroke=0)

        # Decorative dots arc (above the circle)
        if self.with_dots:
            canvas.setFillColor(white)
            num_dots = 15
            arc_radius = r + 12
            start_angle = math.radians(30)
            end_angle = math.radians(150)

            for i in range(num_dots):
                angle = start_angle + (end_angle - start_angle) * (i / (num_dots - 1))
                dx = cx + arc_radius * math.cos(angle)
                dy = cy + arc_radius * math.sin(angle)
                canvas.circle(dx, dy, 3, fill=1, stroke=0)

        # Label under circle
        if self.label:
            canvas.setFillColor(white)
            canvas.setFont('Helvetica-Bold', 10)
            canvas.drawCentredString(cx, -15, self.label)

    def wrap(self, availWidth, availHeight):
        return (self.diameter, self.diameter + (25 if self.label else 0))


class StatisticCard(Flowable):
    """Statistics card with modern design"""

    def __init__(self, value, label, width=120, height=70, bg_color=None, accent_color=None):
        Flowable.__init__(self)
        self.value = str(value)
        self.label = label
        self.card_width = width
        self.card_height = height
        self.bg_color = bg_color or PICCColors.LAVENDER
        self.accent_color = accent_color or PICCColors.PURPLE

    def draw(self):
        canvas = self.canv
        w, h = self.card_width, self.card_height

        # Rounded rectangle background
        canvas.setFillColor(self.bg_color)
        canvas.roundRect(0, 0, w, h, 8, fill=1, stroke=0)

        # Left accent bar
        canvas.setFillColor(self.accent_color)
        canvas.roundRect(0, 0, 6, h, 3, fill=1, stroke=0)

        # Value
        canvas.setFillColor(self.accent_color)
        canvas.setFont('Helvetica-Bold', 22)
        canvas.drawString(15, h - 30, self.value)

        # Label
        canvas.setFillColor(PICCColors.DARK_GRAY)
        canvas.setFont('Helvetica', 9)
        # Word wrap label
        words = self.label.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            if len(' '.join(current_line)) > 15:
                lines.append(' '.join(current_line[:-1]))
                current_line = [word]
        if current_line:
            lines.append(' '.join(current_line))

        y = 20
        for line in lines[:2]:
            canvas.drawString(15, y, line)
            y -= 11

    def wrap(self, availWidth, availHeight):
        return (self.card_width, self.card_height)


class SectionHeader(Flowable):
    """Hand-drawn style section header"""

    def __init__(self, text, width=None, color=None, size=24):
        Flowable.__init__(self)
        self.text = text
        self.header_width = width or CONTENT_WIDTH
        self.color = color or PICCColors.PURPLE
        self.size = size

    def draw(self):
        canvas = self.canv

        # Draw text with slight "hand-drawn" effect
        canvas.setFillColor(self.color)
        canvas.setFont('Times-Bold', self.size)
        canvas.drawString(0, 5, self.text)

        # Underline with slight variation
        canvas.setStrokeColor(self.color)
        canvas.setLineWidth(2)
        text_width = canvas.stringWidth(self.text, 'Times-Bold', self.size)
        canvas.line(0, 0, min(text_width + 20, self.header_width * 0.6), 0)

    def wrap(self, availWidth, availHeight):
        return (self.header_width, self.size + 15)


class QuoteBlock(Flowable):
    """Styled quote block with attribution"""

    def __init__(self, quote, author, role=None, width=None, color=None):
        Flowable.__init__(self)
        self.quote = quote
        self.author = author
        self.role = role
        self.block_width = width or CONTENT_WIDTH - 40
        self.color = color or PICCColors.PURPLE

    def draw(self):
        canvas = self.canv
        w = self.block_width

        # Background
        canvas.setFillColor(PICCColors.LAVENDER)
        canvas.roundRect(0, 0, w, 80, 6, fill=1, stroke=0)

        # Left quote mark bar
        canvas.setFillColor(self.color)
        canvas.roundRect(0, 0, 5, 80, 2, fill=1, stroke=0)

        # Quote mark
        canvas.setFillColor(self.color)
        canvas.setFont('Times-Bold', 36)
        canvas.drawString(15, 50, '"')

        # Quote text
        canvas.setFillColor(PICCColors.DARK_GRAY)
        canvas.setFont('Times-Italic', 10)
        # Simple word wrap
        words = self.quote.split()
        lines = []
        current = []
        for word in words:
            current.append(word)
            if len(' '.join(current)) > 60:
                lines.append(' '.join(current[:-1]))
                current = [word]
        if current:
            lines.append(' '.join(current))

        y = 55
        for line in lines[:3]:
            canvas.drawString(35, y, line)
            y -= 12

        # Attribution
        canvas.setFont('Helvetica-Bold', 9)
        canvas.setFillColor(self.color)
        attr = f"— {self.author}"
        if self.role:
            attr += f", {self.role}"
        canvas.drawString(35, 10, attr)

    def wrap(self, availWidth, availHeight):
        return (self.block_width, 90)


# =============================================================================
# DOCUMENT BUILDER
# =============================================================================

class PICCReportBuilder:
    """Main report builder class"""

    def __init__(self, output_path):
        self.output_path = output_path
        self.story = []
        self.page_number = 0
        self.setup_styles()

    def setup_styles(self):
        """Configure paragraph styles"""
        self.styles = getSampleStyleSheet()

        # Title style (hand-drawn look)
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            fontName='Times-Bold',
            fontSize=36,
            textColor=PICCColors.PURPLE,
            alignment=TA_CENTER,
            spaceAfter=12,
        ))

        # Section title
        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            fontName='Times-Bold',
            fontSize=24,
            textColor=PICCColors.PURPLE,
            alignment=TA_LEFT,
            spaceAfter=12,
            spaceBefore=20,
        ))

        # Subsection title
        self.styles.add(ParagraphStyle(
            name='SubsectionTitle',
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=PICCColors.DARK_BLUE,
            alignment=TA_LEFT,
            spaceAfter=8,
            spaceBefore=16,
        ))

        # Body text
        self.styles.add(ParagraphStyle(
            name='ReportBody',
            fontName='Helvetica',
            fontSize=10,
            textColor=PICCColors.DARK_GRAY,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            leading=14,
        ))

        # Lead paragraph (intro text)
        self.styles.add(ParagraphStyle(
            name='LeadPara',
            fontName='Helvetica',
            fontSize=11,
            textColor=PICCColors.PURPLE,
            alignment=TA_LEFT,
            spaceAfter=12,
            leading=15,
        ))

        # Footer
        self.styles.add(ParagraphStyle(
            name='Footer',
            fontName='Helvetica',
            fontSize=8,
            textColor=PICCColors.DARK_GRAY,
            alignment=TA_CENTER,
        ))

    def add_cover_page(self, canvas, doc):
        """Draw cover page with gradient and wave pattern"""
        canvas.saveState()

        # Sky gradient simulation
        num_bands = 30
        for i in range(num_bands):
            y = PAGE_HEIGHT - (i * PAGE_HEIGHT / (num_bands * 2))
            h = PAGE_HEIGHT / num_bands
            # Interpolate between sky colors
            t = i / num_bands
            r = 0.53 * (1-t) + 0.29 * t
            g = 0.81 * (1-t) + 0.56 * t
            b = 0.92 * (1-t) + 0.72 * t
            canvas.setFillColor(Color(r, g, b))
            canvas.rect(0, y - h, PAGE_WIDTH, h + 1, fill=1, stroke=0)

        # Ocean/sand area
        canvas.setFillColor(PICCColors.OCEAN)
        canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.4, fill=1, stroke=0)

        # Sand strip
        canvas.setFillColor(PICCColors.SAND)
        canvas.rect(0, PAGE_HEIGHT * 0.35, PAGE_WIDTH, 30, fill=1, stroke=0)

        # White circle for title
        cx, cy = PAGE_WIDTH / 2, PAGE_HEIGHT * 0.55
        canvas.setFillColor(white)
        canvas.circle(cx, cy, 140, fill=1, stroke=0)

        # Title text
        canvas.setFillColor(PICCColors.PURPLE)
        canvas.setFont('Times-Bold', 14)
        canvas.drawCentredString(cx, cy + 80, '2023 - 2024')

        canvas.setFont('Times-Bold', 42)
        canvas.drawCentredString(cx, cy + 30, 'ANNUAL')
        canvas.drawCentredString(cx, cy - 25, 'REPORT')

        # Organization name above circle
        canvas.setFillColor(PICCColors.DARK_BLUE)
        canvas.setFont('Helvetica-Bold', 16)
        canvas.drawCentredString(cx, cy + 160, 'Palm Island')
        canvas.setFont('Helvetica', 10)
        canvas.drawCentredString(cx, cy + 145, 'COMMUNITY COMPANY')

        # Draw wave pattern at bottom
        self._draw_waves(canvas, 0, 0, PAGE_WIDTH, 100)

        canvas.restoreState()

    def add_back_cover(self, canvas, doc):
        """Draw back cover page"""
        canvas.saveState()

        # Sky gradient
        num_bands = 30
        for i in range(num_bands):
            y = PAGE_HEIGHT - (i * PAGE_HEIGHT / (num_bands * 2))
            h = PAGE_HEIGHT / num_bands
            t = i / num_bands
            r = 0.53 * (1-t) + 0.29 * t
            g = 0.81 * (1-t) + 0.56 * t
            b = 0.92 * (1-t) + 0.72 * t
            canvas.setFillColor(Color(r, g, b))
            canvas.rect(0, y - h, PAGE_WIDTH, h + 1, fill=1, stroke=0)

        # Ocean
        canvas.setFillColor(PICCColors.OCEAN)
        canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.5, fill=1, stroke=0)

        # White circle for contact info
        cx, cy = PAGE_WIDTH / 2, PAGE_HEIGHT * 0.55
        canvas.setFillColor(white)
        canvas.circle(cx, cy, 120, fill=1, stroke=0)

        # Contact information
        canvas.setFillColor(PICCColors.DARK_BLUE)
        canvas.setFont('Times-Bold', 16)
        canvas.drawCentredString(cx, cy + 60, 'PALM ISLAND')
        canvas.drawCentredString(cx, cy + 40, 'COMMUNITY COMPANY')

        canvas.setFont('Helvetica', 10)
        canvas.drawCentredString(cx, cy + 10, '61-73 Sturt Street')
        canvas.drawCentredString(cx, cy - 5, 'Townsville QLD 4810')
        canvas.drawCentredString(cx, cy - 25, '07 4421 4300')
        canvas.setFillColor(PICCColors.BLUE)
        canvas.drawCentredString(cx, cy - 45, 'www.picc.com.au')

        canvas.setFillColor(PICCColors.DARK_GRAY)
        canvas.setFont('Helvetica', 8)
        canvas.drawCentredString(cx, cy - 70, 'ACN 640 793 728')

        # Tagline below circle
        canvas.setFillColor(white)
        canvas.setFont('Helvetica-Oblique', 11)
        canvas.drawCentredString(cx, cy - 160, 'Our Community, Our Future, Our Way')

        # Draw waves
        self._draw_waves(canvas, 0, 0, PAGE_WIDTH, 100)

        canvas.restoreState()

    def _draw_waves(self, canvas, x, y, width, height):
        """Draw layered wave pattern with dots"""
        colors = [PICCColors.LAVENDER, PICCColors.BLUE, PICCColors.DARK_BLUE]
        wave_heights = [height * 0.4, height * 0.65, height]

        import random

        for i, (color, wave_h) in enumerate(zip(colors, wave_heights)):
            canvas.setFillColor(color)

            path = canvas.beginPath()
            path.moveTo(x, y)

            points = 30
            for j in range(points + 1):
                px = x + (j / points) * width
                py = y + wave_h * (0.6 + 0.15 * math.sin(j * 0.25 + i * 0.8))
                py += 6 * math.sin(px / 35 + i * 1.2)
                path.lineTo(px, py)

            path.lineTo(x + width, y)
            path.close()
            canvas.drawPath(path, fill=1, stroke=0)

            # Dots
            canvas.setFillColor(white)
            random.seed(100 + i)
            for _ in range(20):
                dx = x + random.random() * width
                dy = y + random.random() * wave_h * 0.6
                r = random.uniform(2, 4)
                canvas.circle(dx, dy, r, fill=1, stroke=0)

    def add_page_header(self, canvas, doc):
        """Add page header"""
        canvas.saveState()
        canvas.setFillColor(PICCColors.DARK_GRAY)
        canvas.setFont('Helvetica', 8)
        canvas.drawString(MARGIN_LEFT, PAGE_HEIGHT - 15,
                         'PALM ISLAND COMMUNITY COMPANY')
        canvas.drawRightString(PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 15,
                              'ANNUAL REPORT 2023-2024')

        # Thin line
        canvas.setStrokeColor(PICCColors.LIGHT_GRAY)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN_LEFT, PAGE_HEIGHT - 20,
                   PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 20)
        canvas.restoreState()

    def add_page_footer(self, canvas, doc):
        """Add page footer with page number"""
        canvas.saveState()

        # Page number in circle
        page_num = canvas.getPageNumber()
        if page_num > 1:  # Skip cover
            cx = PAGE_WIDTH / 2
            cy = 20

            canvas.setStrokeColor(PICCColors.PURPLE)
            canvas.setLineWidth(1)
            canvas.circle(cx, cy, 12, fill=0, stroke=1)

            canvas.setFillColor(PICCColors.PURPLE)
            canvas.setFont('Helvetica-Bold', 9)
            canvas.drawCentredString(cx, cy - 3, str(page_num - 1))

        canvas.restoreState()

    def on_first_page(self, canvas, doc):
        """First page (cover) callback"""
        self.add_cover_page(canvas, doc)

    def on_later_pages(self, canvas, doc):
        """Later pages callback"""
        self.add_page_header(canvas, doc)
        self.add_page_footer(canvas, doc)

    def build_content_pages(self):
        """Build all content pages"""

        # Page 2: Leadership Messages
        self.add_leadership_section()

        # Page 3: Executive Summary
        self.add_executive_summary()

        # Page 4: Year at a Glance
        self.add_year_at_glance()

        # Page 5: Key Highlights
        self.add_highlights()

        # Page 6: Governance
        self.add_governance()

        # Page 7: Delegated Authority
        self.add_delegated_authority()

        # Page 8: Health Services
        self.add_health_services()

        # Page 9: Family Services
        self.add_family_services()

        # Page 10: Economic Development
        self.add_economic_development()

        # Page 11: Our People
        self.add_workforce()

        # Page 12: Financial Summary
        self.add_financials()

        # Page 13: Services List
        self.add_services_list()

        # Page 14: Looking Forward
        self.add_looking_forward()

        # Page 15: Acknowledgments
        self.add_acknowledgments()

    def add_leadership_section(self):
        """Add leadership messages page"""
        self.story.append(PageBreak())

        # CEO Message
        self.story.append(SectionHeader('Message from the CEO', color=PICCColors.DARK_BLUE))
        self.story.append(Spacer(1, 10))

        lead = """In 2018/19 I wrote, "Now that our first decade is behind us, watch this space for what we will achieve in our second." With PICC more than halfway through our second decade now, our achievements are growing almost by the day."""
        self.story.append(Paragraph(lead, self.styles['LeadPara']))

        ceo_content = """The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before.

We now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer.

One of the changes I am most excited about is the delegated authority, which represents a significant and positive shift for children in care on Palm Island. At last, the community will decide the care arrangements for children who cannot stay at home.

The number of staff and trainees we employ has increased by a third since last year, with nearly two hundred people now working for PICC. Impressively, three-quarters of our workforce are Palm Islanders.

Everything we do is for, with, and because of the people of this beautiful community."""

        for para in ceo_content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

        self.story.append(Spacer(1, 10))
        self.story.append(Paragraph('<b>Rachel Atkinson</b><br/><i>Chief Executive Officer</i>',
                                   self.styles['ReportBody']))

        self.story.append(Spacer(1, 20))

        # Chair Message
        self.story.append(SectionHeader('Message from the Chair', color=PICCColors.DARK_BLUE))
        self.story.append(Spacer(1, 10))

        chair_lead = """In my fifth year as Chair of the Board, my commitment to ensuring that PICC remains the exemplary service provider that Palm Island deserves has only grown stronger."""
        self.story.append(Paragraph(chair_lead, self.styles['LeadPara']))

        chair_content = """PICC plays a crucial role in our community, offering essential services that impact the lives of many. I am deeply conscious of the responsibility I hold to the people of Palm Island, ensuring that our company is not only well-managed and sustainable but also progressing in the right direction.

The positive changes we strive for are becoming evident within the community. This is particularly noticeable among our young people, who are beginning to feel a sense of optimism about the future of Palm Island.

I am immensely grateful for the unwavering support of my fellow Board members. Together, we are steering PICC towards a brighter future for Palm Island."""

        for para in chair_content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

        self.story.append(Spacer(1, 10))
        self.story.append(Paragraph('<b>Luella Bligh</b><br/><i>Chair, Board of Directors</i>',
                                   self.styles['ReportBody']))

    def add_executive_summary(self):
        """Add executive summary page"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Executive Summary'))
        self.story.append(Spacer(1, 10))

        summary = """The 2023-24 fiscal year represents a transformative period for the Palm Island Community Company. With 197 dedicated staff members delivering 16+ integrated services, we continue to strengthen our community-controlled approach to holistic wellbeing and self-determination.

This year saw the historic implementation of Delegated Authority under the Child Protection Act – a decades-long goal achieved. Our community now decides care arrangements for children who cannot stay at home, marking a profound shift toward true self-determination.

Our health service delivered 17,488 episodes of care to 2,283 clients. Safe Haven supported 1,187 children. The Family Care Service provided 6,698 placement nights. These numbers represent real families, real healing, real change.

Staff numbers grew 30% to 197, with over 70% being Palm Islanders – extraordinarily high for remote communities. This is our strength: local people serving local families with deep cultural understanding.

Revenue reached $23.4 million, quadrupling over the past decade. Every dollar invested returns multiple times over in community benefit, employment, and opportunity."""

        for para in summary.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

    def add_year_at_glance(self):
        """Add year at a glance statistics page"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Year at a Glance'))
        self.story.append(Spacer(1, 15))

        # Statistics grid
        stats = [
            ('197', 'Total Staff Members'),
            ('$23.4M', 'Total Revenue'),
            ('16', 'Integrated Services'),
            ('2,283', 'Health Clients'),
            ('17,488', 'Episodes of Care'),
            ('1,187', 'Children Supported'),
        ]

        # Create stats cards in rows of 3
        for i in range(0, len(stats), 3):
            row_stats = stats[i:i+3]
            row_elements = []
            for value, label in row_stats:
                row_elements.append(StatisticCard(value, label, width=160, height=65))

            # Create table for row
            if row_elements:
                t = Table([row_elements], colWidths=[170] * len(row_elements))
                t.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 5),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                ]))
                self.story.append(t)
                self.story.append(Spacer(1, 15))

        # Additional context
        self.story.append(Spacer(1, 10))
        context = """These figures represent a 30% growth in staff numbers from 2023, with turnover quadrupling over the past decade. Over 70% of staff are Palm Islanders, and over 80% identify as Aboriginal or Torres Strait Islander."""
        self.story.append(Paragraph(context, self.styles['ReportBody']))

    def add_highlights(self):
        """Add key highlights page"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Key Highlights'))
        self.story.append(Spacer(1, 10))

        highlights = [
            ('Delegated Authority', 'Historic achievement of community control over child protection decisions. $107.8M funding over 4 years.'),
            ('30% Workforce Growth', 'Staff increased from 151 to 197, with over 70% being Palm Islanders.'),
            ('First 1,000 Days Program', 'New program ensuring Indigenous families get quicker access to care during critical early childhood.'),
            ('Digital Service Centre', 'Telstra partnership creating 21 quality jobs with capacity for 30, supporting 50 languages.'),
            ('Health Service Expansion', '17,488 episodes of care delivered to 2,283 clients through culturally appropriate services.'),
            ('Family Services Strengthened', 'Safe Haven supported 1,187 children; Family Care provided 6,698 placement nights.'),
        ]

        for title, desc in highlights:
            self.story.append(Paragraph(f'<b>{title}</b>', self.styles['SubsectionTitle']))
            self.story.append(Paragraph(desc, self.styles['ReportBody']))
            self.story.append(Spacer(1, 8))

    def add_governance(self):
        """Add governance section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Corporate Governance'))
        self.story.append(Spacer(1, 10))

        content = """PICC is governed by a Board of Directors elected by community members. As an Aboriginal and Torres Strait Islander community-controlled organization, only Palm Islanders can be members, ensuring true community ownership and accountability."""
        self.story.append(Paragraph(content, self.styles['ReportBody']))
        self.story.append(Spacer(1, 15))

        # Board members table
        self.story.append(Paragraph('<b>Members of the Board</b>', self.styles['SubsectionTitle']))

        board_data = [
            ['Name', 'Position'],
            ['Luella Bligh', 'Chair'],
            ['Rhonda Phillips', 'Director'],
            ['Allan Palm Island', 'Director'],
            ['Matthew Lindsay', 'Company Secretary'],
            ['Harriet Hulthen', 'Director'],
            ['Raymond W. Palmer Snr', 'Director'],
            ['Cassie Lang', 'Director'],
        ]

        t = Table(board_data, colWidths=[200, 150])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PICCColors.DARK_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BACKGROUND', (0, 1), (-1, -1), PICCColors.OFF_WHITE),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [PICCColors.OFF_WHITE, white]),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, PICCColors.LIGHT_GRAY),
        ]))
        self.story.append(t)

        self.story.append(Spacer(1, 20))

        # Report card
        self.story.append(Paragraph('<b>Report Card: Staff Numbers</b>', self.styles['SubsectionTitle']))
        staff_data = [
            ['', '30 June 2024', '30 June 2023', '30 June 2022'],
            ['No. of staff members', '197', '151', '152'],
        ]
        t = Table(staff_data, colWidths=[150, 100, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PICCColors.BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 1), (0, -1), PICCColors.LAVENDER),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, PICCColors.LIGHT_GRAY),
        ]))
        self.story.append(t)

    def add_delegated_authority(self):
        """Add delegated authority section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Bwgcolman Way: Delegated Authority'))
        self.story.append(Spacer(1, 10))

        lead = """A major change to caring arrangements for vulnerable children is at last coming to Palm Island: delegated authority."""
        self.story.append(Paragraph(lead, self.styles['LeadPara']))

        content = """The implementation of Delegated Authority under Sections 148BA and 148BB(3) of the Child Protection Act 1999 represents a historic milestone for Palm Island.

PICC has chosen to name this approach Bwgcolman Way: Empowered and Resilient. "Bwgcolman" meaning "many tribes, one people".

The vision is that all Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country. Palm Island mob leading and creating change for Palm Island children, young people and families.

This authority, backed by $107.8 million in funding over four years, puts decision-making power where it belongs: with the people who know our children, our families, and our culture best."""

        for para in content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

        self.story.append(Spacer(1, 15))
        self.story.append(QuoteBlock(
            "When we make decisions about our children, they need to be made by people who understand our families, our history, our culture.",
            "Community Elder",
            "Palm Island"
        ))

    def add_health_services(self):
        """Add health services section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Primary Health Services'))
        self.story.append(Paragraph('<i>(Bwgcolman Healing Service)</i>', self.styles['ReportBody']))
        self.story.append(Spacer(1, 10))

        content = """The Bwgcolman Healing Service delivered comprehensive primary healthcare to 2,283 clients through 17,488 episodes of care. Our culturally appropriate approach combines Western medicine with traditional healing practices.

In early 2024, the Bwgcolman Healing Service passed the Quality Practice Accreditation assessment by the Royal Australian College of General Practitioners. The assessors made special mention of the outstanding cleanliness, high documentation standards, and excellent professional standards."""

        for para in content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

        self.story.append(Spacer(1, 15))

        # Health stats table
        health_data = [
            ['Metric', '2023/24', '2022/23', '2021/22'],
            ['Total Clients', '2,283', '2,050', '1,965'],
            ['Episodes of Care', '17,488', '18,021', '18,510'],
            ['Health Checks (715)', '779', '610', '873'],
            ['Child Health Checks', '128', '345', '167'],
            ['GP Management Plans', '293', '411', '124'],
        ]

        t = Table(health_data, colWidths=[150, 90, 90, 90])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PICCColors.DARK_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 1), (0, -1), PICCColors.LAVENDER),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [PICCColors.OFF_WHITE, white]),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, PICCColors.LIGHT_GRAY),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ]))
        self.story.append(t)

    def add_family_services(self):
        """Add family services section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Community Services'))
        self.story.append(Spacer(1, 10))

        content = """Our community services span the full spectrum of support, from early intervention to crisis response. The Children and Family Centre serves as a hub for family support, with programs tailored to Palm Island's large youth population (32% aged 14 or under).

Safe Haven supported 1,187 children, providing a safe space during family crisis. The Safe House delivered 1,439 placement nights. Family Care Service provided 6,698 placement nights, keeping children connected to family and community."""

        for para in content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

        self.story.append(Spacer(1, 15))

        # Services stats
        services_data = [
            ['Service', '2023/24', '2022/23', '2021/22'],
            ['Family Care - Placement Nights', '6,698', '5,656', '5,390'],
            ['Safe House - Placement Nights', '1,439', '1,069', '1,387'],
            ['Safe Haven - Children Supported', '1,187', '950', '934'],
            ['Diversionary Services Users', '500+', '1,446', '1,167'],
        ]

        t = Table(services_data, colWidths=[180, 85, 85, 85])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PICCColors.DARK_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 1), (0, -1), PICCColors.LAVENDER),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [PICCColors.OFF_WHITE, white]),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, PICCColors.LIGHT_GRAY),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ]))
        self.story.append(t)

    def add_economic_development(self):
        """Add economic development section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Economic Development'))
        self.story.append(Spacer(1, 10))

        content = """Economic self-sufficiency is central to community empowerment. Our social enterprises employ 44 staff, while the Telstra Digital Service Centre has created 21 high-quality jobs.

The Digital Service Centre, developed in partnership with Telstra, Advance Queensland, and the Deadly Innovation Strategy, demonstrates what's possible when investment meets community capability. Staff complete 12 weeks of TAFE training, 5 weeks of Telstra-specific training, and earn a Certificate III in Business.

Currently supporting customers across 50 languages, the centre has capacity for 30 staff – a target we're working toward as we continue recruitment and training."""

        for para in content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

        self.story.append(Spacer(1, 15))
        self.story.append(QuoteBlock(
            "Quality jobs that don't require leaving Country – that's the future we're building.",
            "Rachel Atkinson",
            "CEO"
        ))

    def add_workforce(self):
        """Add workforce section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Our People'))
        self.story.append(Spacer(1, 10))

        content = """PICC's workforce grew 30% to 197 staff – tripling over the past decade. More remarkably, over 70% are Palm Islanders, and over 80% identify as Aboriginal or Torres Strait Islander.

This level of local employment is extraordinarily high for remote communities. It means families can stay together, income stays in the community, and our services are delivered by people with deep cultural understanding.

We invest heavily in training and professional development, creating clear career pathways from entry-level positions to leadership roles."""

        for para in content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

        self.story.append(Spacer(1, 15))

        # Stats cards
        stats = [
            ('197', 'Total Staff'),
            ('70%+', 'Palm Islander Staff'),
            ('80%+', 'Indigenous Staff'),
            ('3x', '10-Year Growth'),
        ]

        row_elements = [StatisticCard(v, l, width=120, height=60) for v, l in stats]
        t = Table([row_elements], colWidths=[130] * 4)
        t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ]))
        self.story.append(t)

    def add_financials(self):
        """Add financial summary section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Summary Financial Report'))
        self.story.append(Paragraph('<i>30 June 2024</i>', self.styles['ReportBody']))
        self.story.append(Spacer(1, 10))

        # Balance sheet
        self.story.append(Paragraph('<b>Balance Sheet</b>', self.styles['SubsectionTitle']))

        balance_data = [
            ['', '2024', '2023'],
            ['Current Assets', '$8,156,480', '$5,428,897'],
            ['Non Current Assets', '$2,702,284', '$1,633,389'],
            ['TOTAL Assets', '$10,858,764', '$7,062,286'],
            ['Current Liabilities', '$5,969,264', '$3,025,785'],
            ['Non Current Liabilities', '$1,351,259', '$220,537'],
            ['TOTAL Liabilities', '$7,320,523', '$3,246,322'],
            ['NET ASSETS', '$3,538,241', '$3,815,964'],
        ]

        t = Table(balance_data, colWidths=[180, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PICCColors.DARK_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 3), (-1, 3), PICCColors.LAVENDER),
            ('BACKGROUND', (0, 6), (-1, 6), PICCColors.LAVENDER),
            ('BACKGROUND', (0, 7), (-1, 7), PICCColors.LAVENDER),
            ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Bold'),
            ('FONTNAME', (0, 6), (-1, 7), 'Helvetica-Bold'),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, PICCColors.LIGHT_GRAY),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ]))
        self.story.append(t)

        self.story.append(Spacer(1, 15))

        # Income statement
        self.story.append(Paragraph('<b>Income and Expenditure</b>', self.styles['SubsectionTitle']))

        income_data = [
            ['', '2024', '2023'],
            ['INCOME', '$23,400,335', '$20,103,686'],
            ['Total Labour Costs (60%)', '$14,282,962', '$11,477,036'],
            ['Administration (21%)', '$5,000,820', '$4,133,848'],
            ['Travel & Training (8%)', '$1,778,367', '$1,611,707'],
            ['Client Costs (5%)', '$1,156,713', '$1,094,877'],
            ['Property & Energy (4%)', '$1,058,084', '$710,794'],
            ['Motor Vehicle (2%)', '$401,112', '$360,093'],
            ['TOTAL Expenditure', '$23,678,058', '$19,388,354'],
        ]

        t = Table(income_data, colWidths=[180, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), PICCColors.DARK_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 1), (-1, 1), PICCColors.GREEN),
            ('TEXTCOLOR', (0, 1), (-1, 1), white),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, -1), (-1, -1), PICCColors.LAVENDER),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, PICCColors.LIGHT_GRAY),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ]))
        self.story.append(t)

    def add_services_list(self):
        """Add services list section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Our 16 Services'))
        self.story.append(Spacer(1, 10))

        services = [
            'Bwgcolman Healing Service',
            'Community Justice Group',
            'Digital Service Centre',
            'Diversionary Service',
            'Early Childhood Services (CFC)',
            'Family Care Service',
            'Family Participation Program',
            'Family Wellbeing Centre',
            'NDIS Service',
            'Safe Haven',
            'Safe House',
            'Social and Emotional Wellbeing Service',
            'Specialist Domestic and Family Violence Service',
            'Women\'s Healing Service',
            'Women\'s Service',
            'Youth Service',
        ]

        # Two columns
        mid = len(services) // 2
        col1 = services[:mid]
        col2 = services[mid:]

        rows = []
        for i in range(max(len(col1), len(col2))):
            row = []
            row.append(f'• {col1[i]}' if i < len(col1) else '')
            row.append(f'• {col2[i]}' if i < len(col2) else '')
            rows.append(row)

        t = Table(rows, colWidths=[240, 240])
        t.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('TEXTCOLOR', (0, 0), (-1, -1), PICCColors.DARK_GRAY),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        self.story.append(t)

        self.story.append(Spacer(1, 20))

        # Partners section
        self.story.append(Paragraph('<b>Our Partners</b>', self.styles['SubsectionTitle']))
        partners = """PICC acknowledges our partners: Queensland Government, NIAA, Queensland Health, North Queensland Primary Health Network, Telstra, James Cook University, TAFE Queensland, Palm Island Aboriginal Shire Council, and many more who make our work possible."""
        self.story.append(Paragraph(partners, self.styles['ReportBody']))

    def add_looking_forward(self):
        """Add looking forward section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Looking Forward'))
        self.story.append(Spacer(1, 10))

        content = """As we enter 2024-25, PICC is positioned for continued growth and impact.

Expanding the First 1,000 Days program to ensure every child gets the best possible start in life. This evidence-based approach to early childhood development will have generational impact.

Strengthening our Delegated Authority implementation through the Bwgcolman Way framework. Community-led decision making for child welfare is now a reality – our task is to make it work brilliantly.

Growing the Digital Service Centre to its full 30-person capacity. This Telstra partnership represents the future of remote employment – quality jobs that don't require leaving Country.

Deepening cultural connection across all programs. Language revitalization, cultural healing, and connection to Country remain at the heart of everything we do.

Building workforce capability through training, mentorship, and clear career pathways. Our people are our greatest asset.

The road ahead is one we walk together – community members, staff, board, and partners united in service of Palm Island's future."""

        for para in content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

    def add_acknowledgments(self):
        """Add acknowledgments section"""
        self.story.append(PageBreak())
        self.story.append(SectionHeader('Acknowledgments'))
        self.story.append(Spacer(1, 10))

        content = """Palm Island Community Company acknowledges the Manbarra people as the Traditional Owners of Great Palm Island and the surrounding waters. We pay our respects to Elders past, present, and emerging.

We honor the 42 language groups whose descendants now call Palm Island home – the Bwgcolman, "many tribes" brought together. We acknowledge the profound impact of historical policies, including the Hull River relocation and the Stolen Generations.

PICC thanks our funding partners: Queensland Government, NIAA, Queensland Health, and Northern Queensland Primary Health Network. We thank Telstra for their vision in establishing the Digital Service Centre.

Most importantly, we thank the Palm Island community – the families who trust us with their care, the Elders who guide us, the staff who serve tirelessly, and the young people who inspire us with their potential.

This report is dedicated to all who have contributed to making Palm Island a safer, stronger, and more prosperous place to live."""

        for para in content.split('\n\n'):
            self.story.append(Paragraph(para, self.styles['ReportBody']))

        self.story.append(Spacer(1, 30))

        # Final quote
        self.story.append(QuoteBlock(
            "Our Community, Our Future, Our Way",
            "Palm Island Community Company",
            ""
        ))

    def build(self):
        """Build the complete PDF"""
        # Create output directory
        output_dir = Path(self.output_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)

        # Build document
        doc = SimpleDocTemplate(
            self.output_path,
            pagesize=A4,
            leftMargin=MARGIN_LEFT,
            rightMargin=MARGIN_RIGHT,
            topMargin=MARGIN_TOP,
            bottomMargin=MARGIN_BOTTOM,
        )

        # Build content
        self.build_content_pages()

        # Build PDF with page templates
        doc.build(
            self.story,
            onFirstPage=self.on_first_page,
            onLaterPages=self.on_later_pages,
        )

        print(f'Generated: {self.output_path}')
        return self.output_path


def create_back_cover_page(output_path):
    """Create standalone back cover PDF"""
    from reportlab.pdfgen import canvas as pdf_canvas

    c = pdf_canvas.Canvas(output_path, pagesize=A4)

    # Sky gradient
    num_bands = 30
    for i in range(num_bands):
        y = PAGE_HEIGHT - (i * PAGE_HEIGHT / (num_bands * 2))
        h = PAGE_HEIGHT / num_bands
        t = i / num_bands
        r = 0.53 * (1-t) + 0.29 * t
        g = 0.81 * (1-t) + 0.56 * t
        b = 0.92 * (1-t) + 0.72 * t
        c.setFillColor(Color(r, g, b))
        c.rect(0, y - h, PAGE_WIDTH, h + 1, fill=1, stroke=0)

    # Ocean
    c.setFillColor(PICCColors.OCEAN)
    c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.5, fill=1, stroke=0)

    # White circle
    cx, cy = PAGE_WIDTH / 2, PAGE_HEIGHT * 0.55
    c.setFillColor(white)
    c.circle(cx, cy, 120, fill=1, stroke=0)

    # Contact info
    c.setFillColor(PICCColors.DARK_BLUE)
    c.setFont('Times-Bold', 16)
    c.drawCentredString(cx, cy + 60, 'PALM ISLAND')
    c.drawCentredString(cx, cy + 40, 'COMMUNITY COMPANY')

    c.setFont('Helvetica', 10)
    c.drawCentredString(cx, cy + 10, '61-73 Sturt Street')
    c.drawCentredString(cx, cy - 5, 'Townsville QLD 4810')
    c.drawCentredString(cx, cy - 25, '07 4421 4300')
    c.setFillColor(PICCColors.BLUE)
    c.drawCentredString(cx, cy - 45, 'www.picc.com.au')

    c.setFillColor(PICCColors.DARK_GRAY)
    c.setFont('Helvetica', 8)
    c.drawCentredString(cx, cy - 70, 'ACN 640 793 728')

    # Tagline
    c.setFillColor(white)
    c.setFont('Helvetica-Oblique', 11)
    c.drawCentredString(cx, cy - 160, 'Our Community, Our Future, Our Way')

    # Waves
    colors = [PICCColors.LAVENDER, PICCColors.BLUE, PICCColors.DARK_BLUE]
    wave_heights = [40, 65, 100]

    import random
    for i, (color, wave_h) in enumerate(zip(colors, wave_heights)):
        c.setFillColor(color)
        path = c.beginPath()
        path.moveTo(0, 0)

        for j in range(31):
            px = (j / 30) * PAGE_WIDTH
            py = wave_h * (0.6 + 0.15 * math.sin(j * 0.25 + i * 0.8))
            py += 6 * math.sin(px / 35 + i * 1.2)
            path.lineTo(px, py)

        path.lineTo(PAGE_WIDTH, 0)
        path.close()
        c.drawPath(path, fill=1, stroke=0)

        c.setFillColor(white)
        random.seed(100 + i)
        for _ in range(20):
            dx = random.random() * PAGE_WIDTH
            dy = random.random() * wave_h * 0.6
            r = random.uniform(2, 4)
            c.circle(dx, dy, r, fill=1, stroke=0)

    c.save()
    return output_path


def main():
    """Main entry point"""
    # Get script directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    output_dir = project_root / 'public' / 'reports'
    output_dir.mkdir(parents=True, exist_ok=True)

    main_pdf = output_dir / 'picc-annual-report-2023-24-main.pdf'
    back_pdf = output_dir / 'picc-annual-report-back-cover.pdf'
    final_pdf = output_dir / 'picc-annual-report-2023-24.pdf'

    # Build main report
    print('Building PICC Annual Report 2023-24 (World-Class Design)...')
    builder = PICCReportBuilder(str(main_pdf))
    builder.build()

    # Create back cover
    print('Creating back cover...')
    create_back_cover_page(str(back_pdf))

    # Merge PDFs
    print('Merging documents...')
    try:
        from pypdf import PdfReader, PdfWriter

        writer = PdfWriter()

        # Add main report
        main_reader = PdfReader(str(main_pdf))
        for page in main_reader.pages:
            writer.add_page(page)

        # Add back cover
        back_reader = PdfReader(str(back_pdf))
        writer.add_page(back_reader.pages[0])

        # Write final
        with open(str(final_pdf), 'wb') as f:
            writer.write(f)

        print(f'\nFinal PDF: {final_pdf}')
        print(f'Total pages: {len(writer.pages)}')

        # Cleanup temp files
        main_pdf.unlink(missing_ok=True)
        back_pdf.unlink(missing_ok=True)

    except ImportError:
        print('pypdf not available, using main PDF only')
        import shutil
        shutil.move(str(main_pdf), str(final_pdf))

    print('\nDone!')


if __name__ == '__main__':
    main()
