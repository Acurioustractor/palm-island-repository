"""
PICC Annual Report PDF Generator

This module provides functions to create Palm Island Community Company
annual reports following the established brand guidelines.

Usage:
    from picc_report_generator import PICCReportGenerator

    generator = PICCReportGenerator("Annual_Report_2024-25.pdf")
    generator.add_cover_page(year="2024-2025")
    generator.add_ceo_message(name="Rachel Atkinson", message="...", photo_path="ceo.jpg")
    generator.save()
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import mm, cm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Circle, Rect, Line
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
import math
import random


# =============================================================================
# PICC BRAND COLOURS
# =============================================================================

class PICCColours:
    """PICC brand colour palette"""
    OCEAN_BLUE = HexColor('#4A7C9B')
    DEEP_TEAL = HexColor('#2D5A6B')
    LAVENDER = HexColor('#9B7BB8')
    SOFT_LILAC = HexColor('#C4A8D4')
    SKY_BLUE = HexColor('#87CEEB')
    SAND_BEIGE = HexColor('#F5E6D3')
    SEAFOAM = HexColor('#7FBBB3')
    WARM_GREY = HexColor('#8B8B8B')

    # Logo accent colours
    TURTLE_RED = HexColor('#C41E3A')
    TURTLE_YELLOW = HexColor('#FFD700')
    TURTLE_ORANGE = HexColor('#FF8C00')

    # Text colours
    DARK_TEXT = HexColor('#333333')
    LIGHT_TEXT = white

    # Table colours
    TABLE_HEADER = OCEAN_BLUE
    TABLE_SUBHEADER = HexColor('#6B9BB8')
    TABLE_ALT_ROW = HexColor('#F0F7FA')


# =============================================================================
# PICC PARAGRAPH STYLES
# =============================================================================

def get_picc_styles():
    """Create PICC-branded paragraph styles"""
    styles = getSampleStyleSheet()

    # Main title (brush stroke style)
    styles.add(ParagraphStyle(
        name='PICCTitle',
        fontName='Helvetica-Bold',
        fontSize=28,
        textColor=PICCColours.OCEAN_BLUE,
        alignment=TA_CENTER,
        spaceAfter=12*mm,
        leading=34
    ))

    # Section heading
    styles.add(ParagraphStyle(
        name='PICCSectionHead',
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=PICCColours.OCEAN_BLUE,
        alignment=TA_LEFT,
        spaceBefore=8*mm,
        spaceAfter=6*mm,
        leading=26
    ))

    # Subsection heading
    styles.add(ParagraphStyle(
        name='PICCSubHead',
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=PICCColours.LAVENDER,
        alignment=TA_LEFT,
        spaceBefore=4*mm,
        spaceAfter=3*mm,
        leading=18
    ))

    # Body text
    styles.add(ParagraphStyle(
        name='PICCBody',
        fontName='Helvetica',
        fontSize=10,
        textColor=PICCColours.DARK_TEXT,
        alignment=TA_JUSTIFY,
        spaceBefore=2*mm,
        spaceAfter=2*mm,
        leading=14
    ))

    # Body text on coloured background
    styles.add(ParagraphStyle(
        name='PICCBodyLight',
        fontName='Helvetica',
        fontSize=10,
        textColor=white,
        alignment=TA_JUSTIFY,
        spaceBefore=2*mm,
        spaceAfter=2*mm,
        leading=14
    ))

    # Quote/highlight text
    styles.add(ParagraphStyle(
        name='PICCHighlight',
        fontName='Helvetica-Oblique',
        fontSize=11,
        textColor=PICCColours.LAVENDER,
        alignment=TA_CENTER,
        spaceBefore=4*mm,
        spaceAfter=4*mm,
        leading=15
    ))

    # Bullet points
    styles.add(ParagraphStyle(
        name='PICCBullet',
        fontName='Helvetica',
        fontSize=10,
        textColor=PICCColours.DARK_TEXT,
        alignment=TA_LEFT,
        leftIndent=8*mm,
        bulletIndent=3*mm,
        spaceBefore=1*mm,
        spaceAfter=1*mm,
        leading=13
    ))

    # Caption
    styles.add(ParagraphStyle(
        name='PICCCaption',
        fontName='Helvetica-Oblique',
        fontSize=8,
        textColor=PICCColours.WARM_GREY,
        alignment=TA_CENTER,
        spaceBefore=2*mm,
        spaceAfter=4*mm
    ))

    # Page header
    styles.add(ParagraphStyle(
        name='PICCPageHeader',
        fontName='Helvetica',
        fontSize=8,
        textColor=white,
        alignment=TA_LEFT,
        leading=10
    ))

    return styles


# =============================================================================
# WAVE PATTERN DRAWING
# =============================================================================

def draw_wave_footer(canvas_obj, width, height, y_start=60):
    """
    Draw the PICC layered wave pattern at page bottom.

    Args:
        canvas_obj: ReportLab canvas object
        width: Page width in points
        height: Page height (for reference)
        y_start: Y position where waves start (in mm from bottom)
    """
    y_start_pts = y_start * mm

    # Back wave (soft lilac)
    canvas_obj.setFillColor(PICCColours.SOFT_LILAC)
    path = canvas_obj.beginPath()
    path.moveTo(0, 0)

    for x in range(0, int(width) + 10, 5):
        y = y_start_pts + 12 * math.sin(x / 60) + 8 * math.sin(x / 30) + 5
        path.lineTo(x, y)

    path.lineTo(width, 0)
    path.close()
    canvas_obj.drawPath(path, fill=True, stroke=False)

    # Front wave (deep teal)
    canvas_obj.setFillColor(PICCColours.DEEP_TEAL)
    path = canvas_obj.beginPath()
    path.moveTo(0, 0)

    for x in range(0, int(width) + 10, 5):
        y = (y_start_pts - 18*mm) + 10 * math.sin(x / 45 + 1) + 6 * math.sin(x / 25) + 3
        path.lineTo(x, y)

    path.lineTo(width, 0)
    path.close()
    canvas_obj.drawPath(path, fill=True, stroke=False)

    # Add scattered dots
    draw_dots(canvas_obj, width, y_start_pts)


def draw_dots(canvas_obj, width, y_max):
    """Draw scattered dot pattern on waves"""
    canvas_obj.saveState()

    # Dots on lilac wave
    for _ in range(60):
        x = random.uniform(10, width - 10)
        y = random.uniform(y_max - 20*mm, y_max + 5*mm)
        r = random.uniform(1.5, 3)

        canvas_obj.setFillColor(white)
        canvas_obj.setFillAlpha(0.25)
        canvas_obj.circle(x, y, r, fill=True, stroke=False)

    # Dots on teal wave
    for _ in range(40):
        x = random.uniform(10, width - 10)
        y = random.uniform(5*mm, y_max - 25*mm)
        r = random.uniform(1.5, 2.5)

        canvas_obj.setFillColor(white)
        canvas_obj.setFillAlpha(0.2)
        canvas_obj.circle(x, y, r, fill=True, stroke=False)

    canvas_obj.restoreState()


def draw_page_number(canvas_obj, width, page_num, y_pos=12):
    """Draw centred page number in circle"""
    x = width / 2
    y = y_pos * mm

    # Circle background
    canvas_obj.setFillColor(PICCColours.OCEAN_BLUE)
    canvas_obj.circle(x, y, 8, fill=True, stroke=False)

    # Number
    canvas_obj.setFillColor(white)
    canvas_obj.setFont('Helvetica-Bold', 8)
    canvas_obj.drawCentredString(x, y - 3, str(page_num))


# =============================================================================
# TABLE CREATION
# =============================================================================

def create_picc_table(data, col_widths=None, header_rows=1):
    """
    Create a PICC-styled data table.

    Args:
        data: List of lists containing table data
        col_widths: Optional list of column widths
        header_rows: Number of header rows (default 1)

    Returns:
        Styled Table object
    """
    table = Table(data, colWidths=col_widths)

    style_commands = [
        # Header styling
        ('BACKGROUND', (0, 0), (-1, header_rows - 1), PICCColours.TABLE_HEADER),
        ('TEXTCOLOR', (0, 0), (-1, header_rows - 1), white),
        ('FONTNAME', (0, 0), (-1, header_rows - 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, header_rows - 1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, header_rows - 1), 10),
        ('TOPPADDING', (0, 0), (-1, header_rows - 1), 10),

        # Data row styling
        ('FONTNAME', (0, header_rows), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, header_rows), (-1, -1), 9),
        ('BOTTOMPADDING', (0, header_rows), (-1, -1), 6),
        ('TOPPADDING', (0, header_rows), (-1, -1), 6),

        # Alignment
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]

    # Alternating row colours
    for i in range(header_rows, len(data)):
        if i % 2 == 0:
            style_commands.append(
                ('BACKGROUND', (0, i), (-1, i), PICCColours.TABLE_ALT_ROW)
            )

    table.setStyle(TableStyle(style_commands))
    return table


def create_report_card_table(title, data, years):
    """
    Create a PICC report card style table.

    Args:
        title: Table title
        data: Dict with period names as keys and lists of values
        years: List of year labels for columns

    Returns:
        List of flowable elements
    """
    styles = get_picc_styles()
    elements = []

    # Title
    elements.append(Paragraph(title, styles['PICCSubHead']))

    # Build table data
    header = [''] + years
    table_data = [header]

    for period, values in data.items():
        row = [period] + values
        table_data.append(row)

    # Create and style table
    col_widths = [120] + [80] * len(years)
    table = create_picc_table(table_data, col_widths)
    elements.append(table)
    elements.append(Spacer(1, 6*mm))

    return elements


# =============================================================================
# CHART CREATION
# =============================================================================

def create_picc_bar_chart(data, categories, legend_names=None,
                          width=400, height=180, title=None):
    """
    Create a PICC-styled bar chart.

    Args:
        data: List of data series (each series is a list of values)
        categories: List of category labels
        legend_names: Optional list of series names for legend
        width, height: Chart dimensions
        title: Optional chart title

    Returns:
        Drawing object containing the chart
    """
    drawing = Drawing(width, height)

    chart = VerticalBarChart()
    chart.x = 50
    chart.y = 30
    chart.width = width - 80
    chart.height = height - 60

    chart.data = data
    chart.categoryAxis.categoryNames = categories

    # PICC colours for bars
    bar_colours = [
        PICCColours.OCEAN_BLUE,
        PICCColours.LAVENDER,
        PICCColours.DEEP_TEAL,
        PICCColours.SEAFOAM,
    ]

    for i in range(len(data)):
        chart.bars[i].fillColor = bar_colours[i % len(bar_colours)]

    # Styling
    chart.valueAxis.valueMin = 0
    chart.valueAxis.labels.fontName = 'Helvetica'
    chart.valueAxis.labels.fontSize = 8
    chart.categoryAxis.labels.fontName = 'Helvetica'
    chart.categoryAxis.labels.fontSize = 8
    chart.barSpacing = 2
    chart.groupSpacing = 10

    drawing.add(chart)

    # Add legend if provided
    if legend_names:
        from reportlab.graphics.charts.legends import Legend
        legend = Legend()
        legend.x = width - 100
        legend.y = height - 30
        legend.colorNamePairs = [
            (bar_colours[i], legend_names[i])
            for i in range(len(legend_names))
        ]
        legend.fontName = 'Helvetica'
        legend.fontSize = 8
        drawing.add(legend)

    return drawing


def create_picc_pie_chart(data, labels, width=200, height=200):
    """
    Create a PICC-styled pie chart.

    Args:
        data: List of values
        labels: List of labels
        width, height: Chart dimensions

    Returns:
        Drawing object containing the chart
    """
    drawing = Drawing(width, height)

    pie = Pie()
    pie.x = width / 2 - 60
    pie.y = height / 2 - 60
    pie.width = 120
    pie.height = 120

    pie.data = data
    pie.labels = [f'{labels[i]}\n{data[i]:.0f}%' for i in range(len(data))]

    # PICC colours
    slice_colours = [
        PICCColours.OCEAN_BLUE,
        PICCColours.LAVENDER,
        PICCColours.DEEP_TEAL,
        PICCColours.SEAFOAM,
        PICCColours.SKY_BLUE,
        PICCColours.SOFT_LILAC,
    ]

    for i in range(len(data)):
        pie.slices[i].fillColor = slice_colours[i % len(slice_colours)]
        pie.slices[i].strokeColor = white
        pie.slices[i].strokeWidth = 1

    pie.slices.fontName = 'Helvetica'
    pie.slices.fontSize = 8
    pie.sideLabels = True

    drawing.add(pie)
    return drawing


# =============================================================================
# PAGE TEMPLATES
# =============================================================================

class PICCReportGenerator:
    """
    Main class for generating PICC Annual Reports.

    Example:
        generator = PICCReportGenerator("output.pdf")
        generator.add_cover_page("2024-2025")
        generator.add_ceo_message("Rachel Atkinson", "Message text...", "ceo.jpg")
        generator.add_section("Corporate Governance", content)
        generator.save()
    """

    def __init__(self, filename):
        self.filename = filename
        self.width, self.height = A4
        self.canvas = canvas.Canvas(filename, pagesize=A4)
        self.styles = get_picc_styles()
        self.page_num = 0

    def _new_page(self):
        """Start a new page with standard footer"""
        if self.page_num > 0:
            self.canvas.showPage()
        self.page_num += 1

    def _draw_header(self, text="PALM ISLAND COMMUNITY COMPANY ANNUAL REPORT"):
        """Draw page header"""
        self.canvas.setFillColor(PICCColours.OCEAN_BLUE)
        self.canvas.rect(0, self.height - 15*mm, self.width, 15*mm, fill=True, stroke=False)

        self.canvas.setFillColor(white)
        self.canvas.setFont('Helvetica', 7)
        self.canvas.drawString(15*mm, self.height - 10*mm, text)

    def _draw_footer(self):
        """Draw wave footer and page number"""
        draw_wave_footer(self.canvas, self.width, self.height)
        draw_page_number(self.canvas, self.width, self.page_num)

    def add_cover_page(self, year, background_image=None):
        """
        Add cover page.

        Args:
            year: Report year string (e.g., "2024-2025")
            background_image: Optional path to background image
        """
        self._new_page()

        # Background colour gradient (simplified)
        self.canvas.setFillColor(PICCColours.SKY_BLUE)
        self.canvas.rect(0, self.height/2, self.width, self.height/2, fill=True, stroke=False)

        self.canvas.setFillColor(PICCColours.SAND_BEIGE)
        self.canvas.rect(0, 0, self.width, self.height/2, fill=True, stroke=False)

        # Central white circle
        cx, cy = self.width/2, self.height/2 + 20*mm
        self.canvas.setFillColor(white)
        self.canvas.circle(cx, cy, 80*mm, fill=True, stroke=False)

        # Year
        self.canvas.setFillColor(PICCColours.OCEAN_BLUE)
        self.canvas.setFont('Helvetica-Bold', 16)
        self.canvas.drawCentredString(cx, cy + 40*mm, year)

        # Title
        self.canvas.setFillColor(PICCColours.DARK_TEXT)
        self.canvas.setFont('Helvetica-Bold', 36)
        self.canvas.drawCentredString(cx, cy + 10*mm, "ANNUAL")
        self.canvas.drawCentredString(cx, cy - 25*mm, "REPORT")

        # Wave footer
        draw_wave_footer(self.canvas, self.width, self.height, y_start=55)

        self.page_num = 0  # Cover page is page 0

    def add_ceo_message(self, name, message, signature_name=None):
        """
        Add CEO message page.

        Args:
            name: CEO name
            message: Message text (can be multiple paragraphs separated by \\n\\n)
            signature_name: Name for signature line
        """
        self._new_page()
        self._draw_header()

        # Title
        self.canvas.setFillColor(PICCColours.OCEAN_BLUE)
        self.canvas.setFont('Helvetica-Bold', 24)
        self.canvas.drawString(20*mm, self.height - 40*mm, "Message from the CEO")

        # Message text
        y_pos = self.height - 60*mm
        self.canvas.setFillColor(PICCColours.DARK_TEXT)
        self.canvas.setFont('Helvetica', 10)

        paragraphs = message.split('\n\n')
        for para in paragraphs:
            # Simple text wrapping
            words = para.split()
            line = ""
            for word in words:
                test_line = line + word + " "
                if self.canvas.stringWidth(test_line, 'Helvetica', 10) > 170*mm:
                    self.canvas.drawString(20*mm, y_pos, line.strip())
                    y_pos -= 14
                    line = word + " "
                else:
                    line = test_line
            if line:
                self.canvas.drawString(20*mm, y_pos, line.strip())
                y_pos -= 14
            y_pos -= 8  # Paragraph spacing

        # Signature
        if signature_name:
            y_pos -= 10*mm
            self.canvas.setFont('Helvetica-Bold', 12)
            self.canvas.setFillColor(PICCColours.OCEAN_BLUE)
            self.canvas.drawString(20*mm, y_pos, signature_name or name)

        self._draw_footer()

    def add_section_page(self, title, content_paragraphs, key_achievements=None):
        """
        Add a section page with title and content.

        Args:
            title: Section title
            content_paragraphs: List of paragraph strings
            key_achievements: Optional list of bullet points
        """
        self._new_page()
        self._draw_header()

        # Section title
        self.canvas.setFillColor(PICCColours.OCEAN_BLUE)
        self.canvas.setFont('Helvetica-Bold', 22)
        self.canvas.drawString(20*mm, self.height - 40*mm, title)

        y_pos = self.height - 55*mm

        # Key achievements subtitle
        if key_achievements:
            self.canvas.setFillColor(PICCColours.LAVENDER)
            self.canvas.setFont('Helvetica-Bold', 14)
            self.canvas.drawString(20*mm, y_pos, "Key Achievements")
            y_pos -= 10*mm

            self.canvas.setFillColor(PICCColours.DARK_TEXT)
            self.canvas.setFont('Helvetica', 10)
            for achievement in key_achievements:
                self.canvas.drawString(25*mm, y_pos, f"• {achievement}")
                y_pos -= 12

            y_pos -= 5*mm

        # Content paragraphs
        self.canvas.setFillColor(PICCColours.DARK_TEXT)
        self.canvas.setFont('Helvetica', 10)

        for para in content_paragraphs:
            words = para.split()
            line = ""
            for word in words:
                test_line = line + word + " "
                if self.canvas.stringWidth(test_line, 'Helvetica', 10) > 170*mm:
                    self.canvas.drawString(20*mm, y_pos, line.strip())
                    y_pos -= 14
                    line = word + " "
                else:
                    line = test_line
            if line:
                self.canvas.drawString(20*mm, y_pos, line.strip())
                y_pos -= 14
            y_pos -= 6

        self._draw_footer()

    def add_acknowledgement(self):
        """Add Acknowledgement of Country"""
        ack_text = """The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, the Manbarra people. We also acknowledge the many First Nations persons who were forcibly removed to Palm Island, and we recognise these persons and their descendants as the historical Bwgcolman people. We recognise the continued connection of the Manbarra and Bwgcolman peoples to the land and waters of this beautiful island. We pay respect to Manbarra and Bwgcolman Elders, their ancestors, all First Nations peoples, and our ancestors who walk in the Dreamtime."""

        # Draw in footer area
        self.canvas.setFillColor(PICCColours.SOFT_LILAC)
        self.canvas.rect(0, 70*mm, self.width, 50*mm, fill=True, stroke=False)

        self.canvas.setFillColor(PICCColours.OCEAN_BLUE)
        self.canvas.setFont('Helvetica-Bold', 14)
        self.canvas.drawCentredString(self.width/2, 105*mm, "Acknowledgement of Country")

        # Text (simplified - in practice use text object for wrapping)
        self.canvas.setFillColor(PICCColours.DARK_TEXT)
        self.canvas.setFont('Helvetica', 9)
        # Would need proper text wrapping here

    def add_back_cover(self, address, phone, website, acn):
        """Add back cover with contact details"""
        self._new_page()

        # Background
        self.canvas.setFillColor(PICCColours.SKY_BLUE)
        self.canvas.rect(0, 0, self.width, self.height, fill=True, stroke=False)

        # Central white circle
        cx, cy = self.width/2, self.height/2 + 30*mm
        self.canvas.setFillColor(white)
        self.canvas.circle(cx, cy, 70*mm, fill=True, stroke=False)

        # Organisation name
        self.canvas.setFillColor(PICCColours.OCEAN_BLUE)
        self.canvas.setFont('Helvetica-Bold', 18)
        self.canvas.drawCentredString(cx, cy + 30*mm, "PALM ISLAND")
        self.canvas.drawCentredString(cx, cy + 15*mm, "COMMUNITY COMPANY")

        # Contact details
        self.canvas.setFont('Helvetica', 10)
        self.canvas.setFillColor(PICCColours.DARK_TEXT)

        y = cy - 5*mm
        for line in address.split('\n'):
            self.canvas.drawCentredString(cx, y, line)
            y -= 12

        y -= 5
        self.canvas.drawCentredString(cx, y, phone)
        y -= 12
        self.canvas.drawCentredString(cx, y, website)
        y -= 12
        self.canvas.setFont('Helvetica-Bold', 9)
        self.canvas.setFillColor(PICCColours.OCEAN_BLUE)
        self.canvas.drawCentredString(cx, y, f"ACN {acn}")

        # Footer
        draw_wave_footer(self.canvas, self.width, self.height, y_start=55)

        # Commitment statement
        self.canvas.setFillColor(white)
        self.canvas.setFont('Helvetica', 9)
        statement = "The Palm Island Community Company is deeply committed to the principles of community control and self-determination."
        self.canvas.drawCentredString(self.width/2, 30*mm, statement)

    def save(self):
        """Save the PDF document"""
        self.canvas.save()
        print(f"PDF saved: {self.filename}")


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def create_sample_report(filename="PICC_Annual_Report_Sample.pdf"):
    """Create a sample report demonstrating all features"""

    gen = PICCReportGenerator(filename)

    # Cover
    gen.add_cover_page("2024-2025")

    # CEO Message
    ceo_message = """In 2018/19 I wrote, "Now that our first decade is behind us, watch this space for what we will achieve in our second." With PICC more than halfway through our second decade now, our achievements are growing almost by the day.

The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before.

We now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer."""

    gen.add_ceo_message("Rachel Atkinson", ceo_message, "Rachel Atkinson")

    # Corporate Governance
    gen.add_section_page(
        "Corporate Governance",
        ["PICC continues to have an average of over 80 per cent of its staff members identifying as Aboriginal, Torres Strait Islander or both."],
        key_achievements=[
            "Over 80% Aboriginal and Torres Strait Islander staff",
            "Passed Human Services Quality Framework interim audit",
            "Staff numbers increased by a third"
        ]
    )

    # Back cover
    gen.add_back_cover(
        "61-73 Sturt Street\nTownsville QLD 4810\nPO Box 1415\nTownsville QLD 4810",
        "07 4421 4300",
        "www.picc.com.au",
        "640 793 728"
    )

    gen.save()
    return filename


if __name__ == "__main__":
    output = create_sample_report()
    print(f"Sample report created: {output}")
