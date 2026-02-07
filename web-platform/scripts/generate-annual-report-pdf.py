#!/usr/bin/env python3
"""
PICC Annual Report 2023-24 - PDF Generator

Generates a professional 18-page annual report PDF using reportlab.

Usage:
    python scripts/generate-annual-report-pdf.py

Output:
    /mnt/Palm Island Reposistory/web-platform/public/reports/picc-annual-report-2023-24.pdf

Requirements:
    pip install reportlab --break-system-packages
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from pypdf import PdfReader, PdfWriter
from io import BytesIO
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, Image, Flowable
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# =============================================================================
# PICC BRAND COLORS
# =============================================================================

PURPLE = HexColor('#5B2D8E')
LAVENDER = HexColor('#E8DEFF')
BLUE = HexColor('#2563EB')
DARK = HexColor('#1A202C')
GRAY_50 = HexColor('#F9FAFB')
GRAY_100 = HexColor('#F3F4F6')
GRAY_200 = HexColor('#E5E7EB')
GRAY_500 = HexColor('#6B7280')
GRAY_600 = HexColor('#4B5563')
GRAY_700 = HexColor('#374151')

# =============================================================================
# REPORT DATA
# =============================================================================

REPORT = {
    'title': 'Annual Report 2023-24',
    'organization': 'Palm Island Community Company',
    'short_name': 'PICC',
    'tagline': 'Our Community, Our Future, Our Way',
    'reporting_period': 'July 1, 2023 – June 30, 2024',
    'fiscal_year': '2023-24',
}

EXECUTIVE_SUMMARY = """The 2023-24 fiscal year represents a transformative period for the Palm Island Community Company. With 197 dedicated staff members delivering 16+ integrated services, we continue to strengthen our community-controlled approach to holistic wellbeing and self-determination.

This year saw the historic implementation of Delegated Authority under the Child Protection Act – a decades-long goal achieved. Our community now decides care arrangements for children who cannot stay at home, marking a profound shift toward true self-determination.

Our health service delivered 17,488 episodes of care to 2,283 clients. Safe Haven supported 1,187 children. The Family Care Service provided 6,698 placement nights. These numbers represent real families, real healing, real change.

Staff numbers grew 30% to 197, with over 70% being Palm Islanders – extraordinarily high for remote communities. This is our strength: local people serving local families with deep cultural understanding.

Revenue reached $23.4 million, quadrupling over the past decade. Every dollar invested returns multiple times over in community benefit, employment, and opportunity."""

CHAIR_MESSAGE = """On behalf of the Board of Directors, I am proud to present Palm Island Community Company's Annual Report for 2023-24.

This year marked a profound moment in our journey toward self-determination. The implementation of Delegated Authority means our community now makes decisions about the care of our children. This isn't just policy – it's recognition that Palm Islanders know best how to care for Palm Island families.

Our Board has worked closely with CEO Rachel Atkinson and the executive team to strengthen governance while expanding our services. We've grown our workforce by 30%, created new programs, and maintained the highest standards of accreditation.

I particularly want to acknowledge our staff – the 197 dedicated people who come to work each day committed to serving our community. Over 70% are Palm Islanders. This local employment is transformative for families and the entire community.

We face real challenges. The demands on our services grow each year. Housing, health, and family safety remain critical needs. But we face these challenges together, as a community united in purpose.

Thank you to our government and corporate partners whose funding makes this work possible. Thank you to our Elders whose wisdom guides us. And thank you to every Palm Islander who trusts PICC with their care.

Our community, our future, our way."""

CEO_MESSAGE = """The 2023-24 year has been one of growth, achievement, and deepening impact for PICC.

Our numbers tell a powerful story: 197 staff, 16 integrated services, 2,283 health clients, 17,488 episodes of care, 1,187 children supported through Safe Haven. But behind every number is a family, a story, a life touched by our work.

The implementation of Delegated Authority is our most significant achievement. For decades, Palm Island has advocated for the right to make decisions about our own children. The Bwgcolman Way framework – "Empowered and Resilient" – now guides these decisions. Child Protection matters are decided by community members who understand our culture, our families, our challenges.

Our First 1,000 Days program launched in April 2024, ensuring Indigenous families get quicker access to care during the crucial early years. This evidence-based approach will have generational impact.

The Telstra Digital Service Centre continues to prove that quality employment can happen right here on Palm Island. Our 21 staff serve customers across 50 languages, demonstrating what's possible when investment meets community capability.

I want to thank our Board for their governance and guidance. I thank our incredible staff who bring compassion and professionalism to their work every day. And I thank the community for their trust.

Looking ahead, we will continue to grow, innovate, and serve. Palm Island deserves nothing less."""

LOOKING_FORWARD = """As we enter 2024-25, PICC is positioned for continued growth and impact. Our priorities include:

Expanding the First 1,000 Days program to ensure every child gets the best possible start in life. This evidence-based approach to early childhood development will have generational impact.

Strengthening our Delegated Authority implementation through the Bwgcolman Way framework. Community-led decision making for child welfare is now a reality – our task is to make it work brilliantly.

Growing the Digital Service Centre to its full 30-person capacity. This Telstra partnership represents the future of remote employment – quality jobs that don't require leaving Country.

Deepening cultural connection across all programs. Language revitalization, cultural healing, and connection to Country remain at the heart of everything we do.

Building workforce capability through training, mentorship, and clear career pathways. Our people are our greatest asset.

The road ahead is one we walk together – community members, staff, board, and partners united in service of Palm Island's future."""

ACKNOWLEDGMENTS = """Palm Island Community Company acknowledges the Manbarra people as the Traditional Owners of Great Palm Island and the surrounding waters. We pay our respects to Elders past, present, and emerging.

We honor the 42 language groups whose descendants now call Palm Island home – the Bwgcolman, "many tribes" brought together. We acknowledge the profound impact of historical policies, including the Hull River relocation and the Stolen Generations.

PICC thanks our funding partners: Queensland Government, NIAA, Queensland Health, and Northern Queensland Primary Health Network. We thank our commercial partner Telstra for their vision in establishing the Digital Service Centre.

Most importantly, we thank the Palm Island community – the families who trust us with their care, the Elders who guide us, the staff who serve tirelessly, and the young people who inspire us with their potential.

This report is dedicated to all who have contributed to making Palm Island a safer, stronger, and more prosperous place to live."""

STATISTICS = [
    {'label': 'Total Staff', 'value': '197', 'change': '+30% from 2023'},
    {'label': 'Palm Islander Staff', 'value': '70%+', 'change': 'Local employment'},
    {'label': 'Health Clients', 'value': '2,283', 'change': 'Comprehensive care'},
    {'label': 'Episodes of Care', 'value': '17,488', 'change': 'Health service delivery'},
    {'label': 'Safe Haven Children', 'value': '1,187', 'change': 'Crisis support'},
    {'label': 'Family Care Nights', 'value': '6,698', 'change': 'Placement support'},
    {'label': 'Total Revenue', 'value': '$23.4M', 'change': '4x growth in decade'},
    {'label': 'Integrated Services', 'value': '16', 'change': 'Holistic support'},
    {'label': 'Early Childhood', 'value': '711', 'change': 'Children Q1-Q2'},
]

HIGHLIGHTS = [
    {'title': 'Delegated Authority Implementation', 'stats': '$107.8M over 4 years',
     'description': 'Historic achievement of community control over child protection decisions.'},
    {'title': '30% Workforce Growth', 'stats': '197 staff, 70%+ local',
     'description': 'Staff numbers increased from 151 to 197, with over 70% Palm Islanders.'},
    {'title': 'First 1,000 Days Launch', 'stats': 'Launched April 2024',
     'description': 'New program ensuring Indigenous families get quicker access to care.'},
    {'title': 'Health Service Expansion', 'stats': '17,488 episodes of care',
     'description': 'Comprehensive primary healthcare reaching more community members.'},
    {'title': 'Digital Service Centre', 'stats': '21 staff, 50 languages',
     'description': 'Telstra partnership creating quality employment opportunities.'},
    {'title': 'Family Services Strength', 'stats': '1,187 children supported',
     'description': 'Safe Haven supported children; Family Care provided 6,698 nights.'},
]

BOARD_MEMBERS = [
    {'name': 'Luella Bligh', 'position': 'Chair'},
    {'name': 'Rhonda Phillips', 'position': 'Director'},
    {'name': 'Allan Palm Island', 'position': 'Director'},
    {'name': 'Matthew Lindsay', 'position': 'Company Secretary'},
    {'name': 'Harriet Hulthen', 'position': 'Director'},
    {'name': 'Raymond W. Palmer Snr', 'position': 'Director'},
    {'name': 'Cassie Lang', 'position': 'Director'},
]

SERVICES = [
    'Bwgcolman Healing Service', 'Community Justice Group', 'Children and Family Centre',
    'Diversionary Service', 'Family Care Service', 'Family Participation Program',
    'Family Wellbeing Centre', 'Integrated Team Care', 'NDIS Connector Service',
    'Safe Haven Service', 'Safe House', 'Social and Emotional Wellbeing',
    'Social Enterprises', 'Specialist DFV Service', 'Telstra Digital Service Centre',
    "Women's Healing Service"
]

FINANCIAL_DATA = [
    {'category': 'Labour Costs', 'amount': '$14,282,962', 'percentage': '60%'},
    {'category': 'Admin Expenses', 'amount': '$5,000,820', 'percentage': '21%'},
    {'category': 'Travel & Training', 'amount': '$1,778,367', 'percentage': '8%'},
    {'category': 'Client Costs', 'amount': '$1,156,713', 'percentage': '5%'},
    {'category': 'Property & Energy', 'amount': '$1,058,084', 'percentage': '4%'},
    {'category': 'Motor Vehicle', 'amount': '$401,112', 'percentage': '2%'},
]

TOC_ITEMS = [
    ('Message from the Chair', 3),
    ('Message from the CEO', 4),
    ('Executive Summary', 5),
    ('Year at a Glance', 6),
    ('Key Highlights', 7),
    ('Governance & Leadership', 8),
    ('Delegated Authority: The Bwgcolman Way', 9),
    ('Health Services', 10),
    ('Family Services', 11),
    ('Economic Development', 12),
    ('Our People', 13),
    ('Financial Summary', 14),
    ('Our Services', 15),
    ('Looking Forward', 16),
    ('Acknowledgments', 17),
]


# =============================================================================
# CUSTOM FLOWABLES
# =============================================================================

class ColoredBox(Flowable):
    """A colored rectangle with optional text."""
    def __init__(self, width, height, color, text='', text_color=white, font_size=10):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.color = color
        self.text = text
        self.text_color = text_color
        self.font_size = font_size

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        if self.text:
            self.canv.setFillColor(self.text_color)
            self.canv.setFont('Helvetica-Bold', self.font_size)
            text_width = self.canv.stringWidth(self.text, 'Helvetica-Bold', self.font_size)
            self.canv.drawString((self.width - text_width) / 2, self.height / 2 - self.font_size / 3, self.text)


class StatCard(Flowable):
    """A statistics card with value and label."""
    def __init__(self, value, label, change='', width=55*mm, height=35*mm):
        Flowable.__init__(self)
        self.value = value
        self.label = label
        self.change = change
        self.width = width
        self.height = height

    def draw(self):
        # Background
        self.canv.setFillColor(LAVENDER)
        self.canv.roundRect(0, 0, self.width, self.height, 3*mm, fill=1, stroke=0)

        # Value
        self.canv.setFillColor(PURPLE)
        self.canv.setFont('Helvetica-Bold', 20)
        text_width = self.canv.stringWidth(self.value, 'Helvetica-Bold', 20)
        self.canv.drawString((self.width - text_width) / 2, self.height - 15*mm, self.value)

        # Label
        self.canv.setFillColor(GRAY_600)
        self.canv.setFont('Helvetica', 8)
        text_width = self.canv.stringWidth(self.label, 'Helvetica', 8)
        self.canv.drawString((self.width - text_width) / 2, self.height - 22*mm, self.label)

        # Change
        if self.change:
            self.canv.setFillColor(BLUE)
            self.canv.setFont('Helvetica', 7)
            text_width = self.canv.stringWidth(self.change, 'Helvetica', 7)
            self.canv.drawString((self.width - text_width) / 2, self.height - 28*mm, self.change)


# =============================================================================
# STYLES
# =============================================================================

def get_styles():
    """Create custom paragraph styles for the report."""
    styles = getSampleStyleSheet()

    # Title styles
    styles.add(ParagraphStyle(
        name='ReportTitle',
        fontName='Helvetica-Bold',
        fontSize=36,
        textColor=white,
        alignment=TA_CENTER,
        spaceAfter=6*mm,
    ))

    styles.add(ParagraphStyle(
        name='ReportSubtitle',
        fontName='Helvetica',
        fontSize=18,
        textColor=white,
        alignment=TA_CENTER,
        spaceAfter=4*mm,
    ))

    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=PURPLE,
        spaceAfter=6*mm,
        spaceBefore=8*mm,
    ))

    styles.add(ParagraphStyle(
        name='SectionHeaderWhite',
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=white,
        spaceAfter=6*mm,
    ))

    styles.add(ParagraphStyle(
        name='Subsection',
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=DARK,
        spaceAfter=4*mm,
        spaceBefore=6*mm,
    ))

    styles.add(ParagraphStyle(
        name='ReportBody',
        fontName='Helvetica',
        fontSize=10,
        textColor=DARK,
        alignment=TA_JUSTIFY,
        spaceAfter=4*mm,
        leading=14,
    ))

    styles.add(ParagraphStyle(
        name='LeadershipContent',
        fontName='Helvetica',
        fontSize=10,
        textColor=DARK,
        alignment=TA_JUSTIFY,
        spaceAfter=5*mm,
        leading=15,
    ))

    styles.add(ParagraphStyle(
        name='QuoteText',
        fontName='Helvetica-Oblique',
        fontSize=11,
        textColor=DARK,
        alignment=TA_LEFT,
        leftIndent=10*mm,
        rightIndent=10*mm,
        spaceAfter=2*mm,
        leading=15,
    ))

    styles.add(ParagraphStyle(
        name='QuoteAuthor',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=PURPLE,
        leftIndent=10*mm,
    ))

    styles.add(ParagraphStyle(
        name='TocTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=PURPLE,
        spaceAfter=10*mm,
    ))

    styles.add(ParagraphStyle(
        name='TocItem',
        fontName='Helvetica',
        fontSize=11,
        textColor=DARK,
        spaceAfter=3*mm,
    ))

    styles.add(ParagraphStyle(
        name='AuthorName',
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=PURPLE,
        alignment=TA_RIGHT,
    ))

    styles.add(ParagraphStyle(
        name='AuthorTitle',
        fontName='Helvetica',
        fontSize=10,
        textColor=GRAY_600,
        alignment=TA_RIGHT,
        spaceAfter=8*mm,
    ))

    return styles


# =============================================================================
# PAGE TEMPLATES
# =============================================================================

def cover_page(canvas, doc):
    """Draw the cover page."""
    canvas.saveState()

    # Purple gradient background (simplified as solid)
    canvas.setFillColor(PURPLE)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)

    # Logo
    canvas.setFillColor(white)
    canvas.setFont('Helvetica-Bold', 24)
    canvas.drawCentredString(A4[0]/2, A4[1] - 80*mm, 'PICC')

    # Subtitle
    canvas.setFont('Helvetica', 18)
    canvas.drawCentredString(A4[0]/2, A4[1] - 95*mm, 'Palm Island Community Company')

    # Title
    canvas.setFont('Helvetica-Bold', 36)
    canvas.drawCentredString(A4[0]/2, A4[1] - 130*mm, 'Annual Report')

    # Year
    canvas.setFillColor(LAVENDER)
    canvas.setFont('Helvetica-Bold', 48)
    canvas.drawCentredString(A4[0]/2, A4[1] - 165*mm, '2023-24')

    # Tagline
    canvas.setFillColor(white)
    canvas.setFont('Helvetica-Oblique', 14)
    canvas.drawCentredString(A4[0]/2, A4[1] - 210*mm, REPORT['tagline'])

    # Period
    canvas.setFont('Helvetica', 11)
    canvas.drawCentredString(A4[0]/2, A4[1] - 225*mm, REPORT['reporting_period'])

    canvas.restoreState()


def back_cover_page(canvas, doc):
    """Draw the back cover page."""
    canvas.saveState()

    # Dark background
    canvas.setFillColor(DARK)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)

    # Logo
    canvas.setFillColor(white)
    canvas.setFont('Helvetica-Bold', 20)
    canvas.drawCentredString(A4[0]/2, A4[1]/2 + 40*mm, 'PICC')

    # Tagline
    canvas.setFillColor(LAVENDER)
    canvas.setFont('Helvetica-Oblique', 14)
    canvas.drawCentredString(A4[0]/2, A4[1]/2 + 20*mm, REPORT['tagline'])

    # Contact info
    canvas.setFillColor(white)
    canvas.setFont('Helvetica', 11)
    canvas.drawCentredString(A4[0]/2, A4[1]/2 - 10*mm, 'Palm Island Community Company')
    canvas.drawCentredString(A4[0]/2, A4[1]/2 - 22*mm, 'Palm Island, Queensland, Australia')
    canvas.drawCentredString(A4[0]/2, A4[1]/2 - 34*mm, 'ACN: 640 793 728')

    # Website
    canvas.setFillColor(LAVENDER)
    canvas.setFont('Helvetica', 14)
    canvas.drawCentredString(A4[0]/2, A4[1]/2 - 55*mm, 'www.picc.com.au')

    canvas.restoreState()


def create_back_cover_pdf():
    """Create a standalone back cover PDF."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    # Dark background
    c.setFillColor(DARK)
    c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)

    # Logo
    c.setFillColor(white)
    c.setFont('Helvetica-Bold', 24)
    c.drawCentredString(A4[0]/2, A4[1]/2 + 50*mm, 'PICC')

    # Tagline
    c.setFillColor(LAVENDER)
    c.setFont('Helvetica-Oblique', 14)
    c.drawCentredString(A4[0]/2, A4[1]/2 + 30*mm, REPORT['tagline'])

    # Contact info
    c.setFillColor(white)
    c.setFont('Helvetica', 11)
    c.drawCentredString(A4[0]/2, A4[1]/2 - 10*mm, 'Palm Island Community Company')
    c.drawCentredString(A4[0]/2, A4[1]/2 - 22*mm, 'Palm Island, Queensland, Australia')
    c.drawCentredString(A4[0]/2, A4[1]/2 - 34*mm, 'ACN: 640 793 728')

    # Website
    c.setFillColor(LAVENDER)
    c.setFont('Helvetica', 14)
    c.drawCentredString(A4[0]/2, A4[1]/2 - 55*mm, 'www.picc.com.au')

    c.save()
    buffer.seek(0)
    return buffer


def add_back_cover(pdf_path):
    """Add back cover page to existing PDF."""
    # Read existing PDF
    reader = PdfReader(pdf_path)
    writer = PdfWriter()

    # Copy all existing pages
    for page in reader.pages:
        writer.add_page(page)

    # Create and add back cover
    back_cover_buffer = create_back_cover_pdf()
    back_cover_reader = PdfReader(back_cover_buffer)
    writer.add_page(back_cover_reader.pages[0])

    # Write merged PDF
    with open(pdf_path, 'wb') as output:
        writer.write(output)

    print(f"   Added back cover page")


def add_header(canvas, doc, title):
    """Add a purple header bar to the page."""
    canvas.saveState()
    canvas.setFillColor(PURPLE)
    canvas.rect(0, A4[1] - 25*mm, A4[0], 25*mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont('Helvetica-Bold', 16)
    canvas.drawString(20*mm, A4[1] - 17*mm, title)
    canvas.restoreState()


def add_footer(canvas, doc, page_num):
    """Add footer with organization name and page number."""
    canvas.saveState()
    canvas.setStrokeColor(GRAY_200)
    canvas.line(20*mm, 15*mm, A4[0] - 20*mm, 15*mm)
    canvas.setFillColor(GRAY_500)
    canvas.setFont('Helvetica', 9)
    canvas.drawString(20*mm, 10*mm, 'Palm Island Community Company')
    canvas.drawRightString(A4[0] - 20*mm, 10*mm, str(page_num))
    canvas.restoreState()


# =============================================================================
# CONTENT BUILDERS
# =============================================================================

def build_toc(styles):
    """Build table of contents."""
    elements = []
    elements.append(Paragraph('Contents', styles['TocTitle']))
    elements.append(Spacer(1, 5*mm))

    for title, page in TOC_ITEMS:
        toc_text = f"{title} {'.' * (60 - len(title))} {page}"
        elements.append(Paragraph(toc_text, styles['TocItem']))

    return elements


def build_leadership_page(author, title, position, content, styles):
    """Build a leadership message page."""
    elements = []

    # Author info (right aligned)
    elements.append(Paragraph(author, styles['AuthorName']))
    elements.append(Paragraph(position, styles['AuthorTitle']))
    elements.append(Spacer(1, 5*mm))

    # Content
    for para in content.split('\n\n'):
        if para.strip():
            elements.append(Paragraph(para.strip(), styles['LeadershipContent']))

    return elements


def build_stats_section(styles):
    """Build statistics grid."""
    elements = []

    # Create stats in rows of 3
    stats_data = STATISTICS
    for i in range(0, len(stats_data), 3):
        row_stats = stats_data[i:i+3]
        row_elements = []
        for stat in row_stats:
            card = StatCard(stat['value'], stat['label'], stat.get('change', ''))
            row_elements.append(card)

        # Pad row if needed
        while len(row_elements) < 3:
            row_elements.append(Spacer(55*mm, 35*mm))

        table = Table([row_elements], colWidths=[58*mm, 58*mm, 58*mm])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 5*mm))

    return elements


def build_highlights_section(styles):
    """Build highlights cards."""
    elements = []

    for highlight in HIGHLIGHTS:
        # Create highlight box
        highlight_content = [
            Paragraph(f"<b>{highlight['title']}</b>", styles['Subsection']),
            Paragraph(highlight['description'], styles['ReportBody']),
            Paragraph(f"<font color='#2563EB'><b>{highlight['stats']}</b></font>", styles['ReportBody']),
        ]
        elements.extend(highlight_content)
        elements.append(Spacer(1, 4*mm))

    return elements


def build_board_section(styles):
    """Build board members grid."""
    elements = []

    # Create board table (4 columns)
    board_data = []
    row = []
    for i, member in enumerate(BOARD_MEMBERS):
        member_text = f"<b>{member['name']}</b><br/><font size='8' color='#5B2D8E'>{member['position']}</font>"
        row.append(Paragraph(member_text, ParagraphStyle(
            'BoardMember',
            fontName='Helvetica',
            fontSize=9,
            alignment=TA_CENTER,
            textColor=DARK,
        )))
        if len(row) == 4 or i == len(BOARD_MEMBERS) - 1:
            # Pad row if needed
            while len(row) < 4:
                row.append('')
            board_data.append(row)
            row = []

    table = Table(board_data, colWidths=[42*mm, 42*mm, 42*mm, 42*mm])
    table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_50),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)

    return elements


def build_financial_table(styles):
    """Build financial breakdown table."""
    elements = []

    # Header row
    data = [['Category', 'Amount', '%']]

    # Data rows
    for item in FINANCIAL_DATA:
        data.append([item['category'], item['amount'], item['percentage']])

    table = Table(data, colWidths=[80*mm, 50*mm, 30*mm])
    table.setStyle(TableStyle([
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), PURPLE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        # Body
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ('ALIGN', (2, 1), (2, -1), 'CENTER'),
        ('TEXTCOLOR', (2, 1), (2, -1), PURPLE),
        ('FONTNAME', (2, 1), (2, -1), 'Helvetica-Bold'),
        # Alternating rows
        ('BACKGROUND', (0, 1), (-1, 1), GRAY_50),
        ('BACKGROUND', (0, 3), (-1, 3), GRAY_50),
        ('BACKGROUND', (0, 5), (-1, 5), GRAY_50),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)

    return elements


def build_services_grid(styles):
    """Build services list."""
    elements = []

    # Create services in 2 columns
    services_data = []
    for i in range(0, len(SERVICES), 2):
        row = [SERVICES[i]]
        if i + 1 < len(SERVICES):
            row.append(SERVICES[i + 1])
        else:
            row.append('')
        services_data.append(row)

    table = Table(services_data, colWidths=[85*mm, 85*mm])
    table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (-1, -1), PURPLE),
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_50),
        ('BOX', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)

    return elements


def add_quote_block(text, author, role, styles):
    """Create a quote block."""
    elements = []
    elements.append(Spacer(1, 4*mm))

    # Quote background would be added via table
    quote_data = [[
        Paragraph(f'"{text}"', styles['QuoteText']),
    ], [
        Paragraph(f'— {author}', styles['QuoteAuthor']),
    ], [
        Paragraph(role, ParagraphStyle('QuoteRole', fontName='Helvetica', fontSize=9, textColor=GRAY_600, leftIndent=10*mm)),
    ]]

    table = Table(quote_data, colWidths=[160*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LAVENDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (0, 0), 10),
        ('BOTTOMPADDING', (0, -1), (0, -1), 10),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 4*mm))

    return elements


# =============================================================================
# MAIN PDF BUILDER
# =============================================================================

def build_pdf(output_path):
    """Build the complete annual report PDF."""

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        topMargin=30*mm,
        bottomMargin=20*mm,
        leftMargin=20*mm,
        rightMargin=20*mm,
    )

    styles = get_styles()
    elements = []

    # We'll build pages manually since we need custom headers per page
    # For simplicity, we'll use a flow approach with page breaks

    # Page 1: Cover (handled separately)
    # We'll add a placeholder and draw cover in first page callback

    # Page 2: Table of Contents
    elements.append(PageBreak())  # Skip cover page space
    elements.extend(build_toc(styles))

    # Page 3: Chair Message
    elements.append(PageBreak())
    elements.append(Paragraph('Message from the Chair', styles['SectionHeader']))
    elements.extend(build_leadership_page('Luella Bligh', 'Message from the Chair',
                                          'Chair, Board of Directors', CHAIR_MESSAGE, styles))

    # Page 4: CEO Message
    elements.append(PageBreak())
    elements.append(Paragraph('Message from the CEO', styles['SectionHeader']))
    elements.extend(build_leadership_page('Rachel Atkinson', 'Message from the CEO',
                                          'Chief Executive Officer', CEO_MESSAGE, styles))

    # Page 5: Executive Summary
    elements.append(PageBreak())
    elements.append(Paragraph('Executive Summary', styles['SectionHeader']))
    for para in EXECUTIVE_SUMMARY.split('\n\n'):
        if para.strip():
            elements.append(Paragraph(para.strip(), styles['LeadershipContent']))

    # Page 6: Year at a Glance
    elements.append(PageBreak())
    elements.append(Paragraph('Year at a Glance', styles['SectionHeader']))
    elements.extend(build_stats_section(styles))
    elements.extend(add_quote_block(
        "Every number represents a family, a story, a life touched by our work.",
        "Rachel Atkinson", "Chief Executive Officer", styles
    ))

    # Page 7: Key Highlights
    elements.append(PageBreak())
    elements.append(Paragraph('Key Highlights', styles['SectionHeader']))
    elements.extend(build_highlights_section(styles))

    # Page 8: Governance
    elements.append(PageBreak())
    elements.append(Paragraph('Governance & Leadership', styles['SectionHeader']))
    elements.append(Paragraph(
        "PICC is governed by a Board of Directors elected by community members. As an Aboriginal and Torres Strait Islander community-controlled organization, only Palm Islanders can be members, ensuring true community ownership and accountability.",
        styles['ReportBody']
    ))
    elements.append(Paragraph('Board of Directors', styles['Subsection']))
    elements.extend(build_board_section(styles))
    elements.extend(add_quote_block(
        "Our governance model ensures Palm Islanders remain in control of decisions affecting our community.",
        "Luella Bligh", "Chair", styles
    ))

    # Page 9: Delegated Authority
    elements.append(PageBreak())
    elements.append(Paragraph('Delegated Authority: The Bwgcolman Way', styles['SectionHeader']))
    elements.append(Paragraph(
        "The implementation of Delegated Authority under Sections 148BA and 148BB(3) of the Child Protection Act 1999 represents a historic milestone for Palm Island.",
        styles['ReportBody']
    ))
    elements.append(Paragraph(
        'Under the Bwgcolman Way framework – "Empowered and Resilient" – our community now decides care arrangements for children who cannot safely remain at home. This authority, backed by <b>$107.8 million in funding over four years</b>, puts decision-making power where it belongs: with the people who know our children, our families, and our culture best.',
        styles['ReportBody']
    ))
    elements.extend(add_quote_block(
        "All Manbarra and Bwgcolman children are safe and cared for by family, nurtured by strong and enduring connections to their community, culture and Country.",
        "Bwgcolman Way Vision", "", styles
    ))

    # Page 10: Health Services
    elements.append(PageBreak())
    elements.append(Paragraph('Health Services', styles['SectionHeader']))
    elements.append(Paragraph(
        "The Bwgcolman Healing Service delivered comprehensive primary healthcare to 2,283 clients through 17,488 episodes of care. Our culturally appropriate approach combines Western medicine with traditional healing practices.",
        styles['ReportBody']
    ))
    elements.append(Paragraph('Key Statistics', styles['Subsection']))
    health_stats = [
        StatCard('2,283', 'Total Clients'),
        StatCard('17,488', 'Episodes of Care'),
        StatCard('779', 'Health Checks'),
    ]
    health_table = Table([health_stats], colWidths=[58*mm, 58*mm, 58*mm])
    elements.append(health_table)
    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph('First 1,000 Days Program', styles['Subsection']))
    elements.append(Paragraph(
        "Launched in April 2024, the First 1,000 Days program ensures Indigenous families get quicker access to care during the crucial early years. The integrated team includes a child health nurse, Aboriginal health worker, and GP with maternal and child health focus.",
        styles['ReportBody']
    ))

    # Page 11: Family Services
    elements.append(PageBreak())
    elements.append(Paragraph('Family Services', styles['SectionHeader']))
    elements.append(Paragraph(
        "Our family services span the full spectrum of support, from early intervention to crisis response. The Children and Family Centre serves as a hub for family support, with programs tailored to Palm Island's large youth population (32% aged 14 or under – well above the Queensland average of 19%).",
        styles['ReportBody']
    ))
    family_stats = [
        StatCard('1,187', 'Safe Haven Children'),
        StatCard('1,439', 'Safe House Nights'),
        StatCard('6,698', 'Family Care Nights'),
    ]
    family_table = Table([family_stats], colWidths=[58*mm, 58*mm, 58*mm])
    elements.append(family_table)

    # Page 12: Economic Development
    elements.append(PageBreak())
    elements.append(Paragraph('Economic Development', styles['SectionHeader']))
    elements.append(Paragraph(
        "Economic self-sufficiency is central to community empowerment. Our social enterprises employ 44 staff, while the Telstra Digital Service Centre has created 21 high-quality jobs with capacity for 30.",
        styles['ReportBody']
    ))
    elements.append(Paragraph('Telstra Digital Service Centre', styles['Subsection']))
    econ_stats = [
        StatCard('21', 'Current Staff'),
        StatCard('30', 'Target Capacity'),
        StatCard('50', 'Languages Supported'),
    ]
    econ_table = Table([econ_stats], colWidths=[58*mm, 58*mm, 58*mm])
    elements.append(econ_table)
    elements.append(Spacer(1, 5*mm))
    elements.extend(add_quote_block(
        "Quality jobs that don't require leaving Country – that's the future we're building.",
        "Rachel Atkinson", "CEO", styles
    ))

    # Page 13: Our People
    elements.append(PageBreak())
    elements.append(Paragraph('Our People', styles['SectionHeader']))
    elements.append(Paragraph(
        "PICC's workforce grew 30% to 197 staff – tripling over the past decade. More remarkably, over 70% are Palm Islanders, and over 80% identify as Aboriginal or Torres Strait Islander.",
        styles['ReportBody']
    ))
    people_stats = [
        StatCard('197', 'Total Staff', '+30% from 2023'),
        StatCard('70%+', 'Palm Islander Staff'),
        StatCard('80%+', 'Indigenous Staff'),
    ]
    people_table = Table([people_stats], colWidths=[58*mm, 58*mm, 58*mm])
    elements.append(people_table)
    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph(
        "This level of local employment is extraordinarily high for remote communities. It means families can stay together, income stays in the community, and our services are delivered by people with deep cultural understanding.",
        styles['ReportBody']
    ))

    # Page 14: Financial Summary
    elements.append(PageBreak())
    elements.append(Paragraph('Financial Summary', styles['SectionHeader']))
    elements.append(Paragraph(
        "PICC maintained financial stability while expanding services. Total revenue reached $23.4 million, with turnover having quadrupled over the past decade.",
        styles['ReportBody']
    ))
    elements.append(Paragraph('Expenditure Breakdown', styles['Subsection']))
    elements.extend(build_financial_table(styles))
    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph('Balance Sheet Summary', styles['Subsection']))
    balance_stats = [
        StatCard('$10.9M', 'Total Assets'),
        StatCard('$7.3M', 'Total Liabilities'),
        StatCard('$3.5M', 'Total Equity'),
    ]
    balance_table = Table([balance_stats], colWidths=[58*mm, 58*mm, 58*mm])
    elements.append(balance_table)

    # Page 15: Our Services
    elements.append(PageBreak())
    elements.append(Paragraph('Our 16 Integrated Services', styles['SectionHeader']))
    elements.append(Paragraph(
        "PICC delivers comprehensive, culturally-informed support across every aspect of community life through 16 integrated services.",
        styles['ReportBody']
    ))
    elements.extend(build_services_grid(styles))

    # Page 16: Looking Forward
    elements.append(PageBreak())
    elements.append(Paragraph('Looking Forward', styles['SectionHeader']))
    for para in LOOKING_FORWARD.split('\n\n'):
        if para.strip():
            elements.append(Paragraph(para.strip(), styles['LeadershipContent']))

    # Page 17: Acknowledgments
    elements.append(PageBreak())
    elements.append(Paragraph('Acknowledgments', styles['SectionHeader']))
    for para in ACKNOWLEDGMENTS.split('\n\n'):
        if para.strip():
            elements.append(Paragraph(para.strip(), styles['LeadershipContent']))
    elements.append(Spacer(1, 8*mm))
    elements.append(Paragraph('Our Partners', styles['Subsection']))
    elements.append(Paragraph(
        "Queensland Government • NIAA • Queensland Health • Telstra • Advance Queensland • Northern Queensland Primary Health Network • QATSICPP",
        styles['ReportBody']
    ))

    # Build the document
    def on_first_page(canvas, doc):
        cover_page(canvas, doc)

    def on_later_pages(canvas, doc):
        add_footer(canvas, doc, doc.page)

    doc.build(elements, onFirstPage=on_first_page, onLaterPages=on_later_pages)

    # Add back cover as a separate page using PdfWriter
    add_back_cover(output_path)

    print(f"✅ PDF generated: {output_path}")
    return output_path


# =============================================================================
# MAIN
# =============================================================================

if __name__ == '__main__':
    # Output path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, '..', 'public', 'reports')
    output_path = os.path.join(output_dir, 'picc-annual-report-2023-24.pdf')

    print("=" * 60)
    print("PICC Annual Report 2023-24 - PDF Generator")
    print("=" * 60)
    print()

    build_pdf(output_path)

    print()
    print("=" * 60)
    print("Done!")
    print("=" * 60)
