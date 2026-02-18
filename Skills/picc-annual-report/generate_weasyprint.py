"""
PICC Annual Report Generator - WeasyPrint Version
High-quality PDF generation using HTML/CSS with WeasyPrint
"""

from weasyprint import HTML, CSS
from jinja2 import Template
import os

def generate_picc_report(output_path, data=None):
    """
    Generate a PICC Annual Report PDF using WeasyPrint.

    Args:
        output_path: Path for output PDF
        data: Dictionary with report content (optional, uses defaults)
    """

    # Default data for 2023-24 report
    if data is None:
        data = {
            'year': '2023-2024',

            'ceo_name': 'Rachel Atkinson',
            'ceo_intro': 'In 2018/19 I wrote, "Now that our first decade is behind us, watch this space for what we will achieve in our second." With PICC more than halfway through our second decade now, our achievements are growing almost by the day.',
            'ceo_paragraphs': [
                'The pace at which PICC has been evolving is nothing short of remarkable. Our expanded investment in services has significantly strengthened and enhanced them, making them more robust and effective than ever before.',
                'We now employ three times the number of people compared to ten years ago and our turnover has quadrupled. This substantial growth is directly benefiting Palm Islanders, either through the services we provide or the jobs we offer.',
                'One of the changes I am most excited and proud about is the delegated authority, which represents a significant and positive shift for children in care on Palm Island. At last, the community will decide the care arrangements for children who cannot stay at home, a change for which I have been fighting for decades.',
                'The number of staff and trainees we employ has increased by a third since last year, with nearly two hundred people now working for PICC. Impressively, three-quarters of our workforce are Palm Islanders.',
                'Despite our progress, I am acutely aware that we still have a long way to go. Palm Island continues to lag behind mainland communities in many areas of wellbeing. However, PICC is here to stay and to fight for Palm Islanders to have the services they deserve. Everything we do is for, with, and because of the people of this beautiful community.'
            ],

            'chair_name': 'Luella Bligh',
            'chair_intro': 'In my fifth year as Chair of the Board, my commitment to ensuring that PICC remains the exemplary service provider that Palm Island deserves has only grown stronger.',
            'chair_paragraphs': [
                'PICC plays a crucial role in our community, offering essential services that impact the lives of many. I am deeply conscious of the responsibility I hold to the people of Palm Island, ensuring that our company is not only well-managed and sustainable but also progressing in the right direction.',
                'The positive changes we strive for are becoming evident within the community. This is particularly noticeable among our young people, who are beginning to feel a sense of optimism about the future of Palm Island. Their hope and enthusiasm are a testament to the progress we are making.',
                'I am immensely grateful for the unwavering support of my fellow Board members. Their dedication and collaborative efforts have been instrumental in guiding PICC towards achieving our shared goals. Together, we are steering PICC towards a brighter future for Palm Island.'
            ],

            'acknowledgement': 'The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, the Manbarra people. We also acknowledge the many First Nations persons who were forcibly removed to Palm Island, and we recognise these persons and their descendants as the historical Bwgcolman people. We pay respect to Manbarra and Bwgcolman Elders, their ancestors, all First Nations peoples, and our ancestors who walk in the Dreamtime.',

            'key_achievements': [
                'PICC continues to have an average of over 80 per cent of its staff members identifying as Aboriginal, Torres Strait Islander or both.',
                'The proportion of staff members living on Palm Island is still above 70 per cent.',
                'The Palm Island Holding Company Ltd was officially wound up after completion of final reporting.',
                'In November 2023, PICC passed a Human Services Quality Framework interim audit with flying colours.'
            ],

            'board_members': [
                'Luella Bligh, Chair',
                'Rhonda Phillips, Director',
                'Allan Palm Island, Director',
                'Matthew Lindsay, Company Secretary',
                'Harriet Hulthen, Director',
                'Raymond W. Palmer Snr, Director',
                'Cassie Lang, Director'
            ],

            'services': [
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
                "Women's Service",
                'Youth Service'
            ],

            'staff_years': ['30 June 2024', '30 June 2023', '30 June 2022'],
            'staff_counts': ['197', '151', '152']
        }

    # Read template
    template_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(template_dir, 'templates', 'annual_report.html')

    with open(template_path, 'r') as f:
        template_content = f.read()

    # Render with Jinja2
    template = Template(template_content)
    html_content = template.render(**data)

    # Generate PDF with WeasyPrint
    html = HTML(string=html_content, base_url=template_dir)
    html.write_pdf(output_path)

    print(f"✓ PDF generated: {output_path}")
    return output_path


if __name__ == "__main__":
    output = "/sessions/upbeat-cool-shannon/mnt/Palm Island Reposistory/PICC_Annual_Report_WeasyPrint.pdf"
    generate_picc_report(output)
