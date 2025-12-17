// PICC Annual Report Figma Plugin - Main Code
// This runs in Figma's sandbox and communicates with the UI

// Component type mappings from Figma to web components
const COMPONENT_MAPPINGS: Record<string, string> = {
  'hero': 'ReportHero',
  'hero-section': 'ReportHero',
  'impact-stat': 'ImpactStat',
  'impact-stats': 'ImpactStatsGrid',
  'stats-grid': 'ImpactStatsGrid',
  'section': 'Section',
  'section-header': 'SectionHeader',
  'quote': 'QuoteShowcase',
  'quote-showcase': 'QuoteShowcase',
  'leadership': 'LeadershipMessage',
  'leadership-message': 'LeadershipMessage',
  'story-card': 'StoryCard',
  'story-grid': 'StoryGrid',
  'stories': 'StoryGrid',
  'dollar-breakdown': 'DollarBreakdown',
  'financial': 'FinancialDonut',
  'financial-donut': 'FinancialDonut',
  'video': 'FeaturedVideo',
  'video-grid': 'VideoGrid',
  'photo-gallery': 'PhotoGallery',
  'gallery': 'PhotoGallery',
  'hero-gallery': 'HeroGallery',
  'service-showcase': 'ServiceShowcase',
  'services': 'ServiceShowcase',
  'service-impact': 'ServiceImpact',
  'timeline': 'Timeline',
  'milestone': 'MilestoneCounter',
  'milestones': 'MilestoneCounter',
  'project-showcase': 'ProjectShowcase',
  'projects': 'ProjectShowcase',
  'divider': 'Divider',
  'person-quote': 'PersonQuoteGrid',
  'person-quotes': 'PersonQuoteGrid',
};

// Show the UI
figma.showUI(__html__, {
  width: 480,
  height: 640,
  themeColors: true
});

// Handle messages from UI
figma.ui.onmessage = async (msg: { type: string; payload?: any }) => {
  switch (msg.type) {
    case 'export-selection':
      await exportSelection();
      break;
    case 'export-page':
      await exportCurrentPage();
      break;
    case 'export-all':
      await exportAllPages();
      break;
    case 'get-selection':
      sendSelectionInfo();
      break;
    case 'get-pages':
      await sendPagesInfo();
      break;
    case 'publish':
      await publishToAPI(msg.payload);
      break;
    case 'create-template':
      await createFromTemplate(msg.payload);
      break;
    case 'close':
      figma.closePlugin();
      break;
  }
};

// Create frames from template
async function createFromTemplate(template: any) {
  figma.ui.postMessage({ type: 'template-status', payload: { status: 'creating', message: 'Creating frames...' } });

  try {
    // Create a new page for the report
    const page = figma.createPage();
    page.name = template.name || 'Annual Report 2024-25';
    await figma.setCurrentPageAsync(page);

    let yOffset = 0;
    const spacing = template.designTokens?.spacing?.section || 80;

    // Load fonts
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });

    // Create each section
    for (const section of template.sections) {
      const frame = figma.createFrame();
      // Name frames so export auto-detection works (based on keywords in the frame name)
      // `section.id` is used when it already contains a known keyword (e.g. "impact-stats", "photo-gallery").
      // Some sections (like CEO/Chair messages) need a keyword alias (e.g. "leadership") to map correctly.
      const exportKey =
        section.type === 'LeadershipMessage'
          ? 'leadership'
          : section.type === 'Section' || section.type === 'SectionHeader'
            ? 'section'
            : String(section.id || section.name || section.type || 'section');
      frame.name = `${exportKey} - ${section.name}`;
      frame.resize(section.width || 1440, section.height || 600);
      frame.x = 0;
      frame.y = yOffset;

      // Set background color based on section type
      const bgColor = getSectionBackground(section, template.designTokens);
      frame.fills = [{ type: 'SOLID', color: bgColor }];

      // Add section content
      await addSectionContent(frame, section, template.designTokens);

      yOffset += frame.height + spacing;
    }

    // Add component indicators
    addComponentLabels(page, template.sections, spacing);

    figma.ui.postMessage({
      type: 'template-status',
      payload: {
        status: 'complete',
        message: `Created ${template.sections.length} sections on "${page.name}"`,
        pageId: page.id
      }
    });

    // Zoom to fit
    figma.viewport.scrollAndZoomIntoView(page.children);

  } catch (error) {
    figma.ui.postMessage({
      type: 'template-status',
      payload: { status: 'error', message: String(error) }
    });
  }
}

// Get background color for section
function getSectionBackground(section: any, tokens: any): RGB {
  const colors: Record<string, RGB> = {
    'ReportHero': hexToRgb(tokens?.colors?.primary || '#1e3a5f'),
    'QuoteShowcase': hexToRgb('#f8f5f0'),
    'Section': hexToRgb('#ffffff'),
    'LeadershipMessage': hexToRgb('#fefdfb'),
    'ImpactStatsGrid': hexToRgb('#f0fdf4'),
    'Timeline': hexToRgb('#fefdfb'),
    'StoryGrid': hexToRgb('#ffffff'),
    'PersonQuoteGrid': hexToRgb('#f8f5f0'),
    'ProjectShowcase': hexToRgb('#1e3a5f'),
    'FinancialDonut': hexToRgb('#fefdfb'),
    'DollarBreakdown': hexToRgb('#2d6a4f'),
    'PhotoGallery': hexToRgb('#ffffff'),
    'ServiceShowcase': hexToRgb('#fefdfb'),
  };

  // Check if section has explicit background
  if (section.props?.backgroundColor) {
    return hexToRgb(section.props.backgroundColor);
  }

  return colors[section.type] || hexToRgb('#ffffff');
}

// Add content to section frame
async function addSectionContent(frame: FrameNode, section: any, tokens: any) {
  const padding = 60;
  const textColor = section.props?.textColor === 'white' ? hexToRgb('#ffffff') : hexToRgb('#1f2937');
  const isDark = section.type === 'ReportHero' || section.type === 'ProjectShowcase' || section.type === 'DollarBreakdown';

  // Add title
  if (section.props?.title) {
    const title = figma.createText();
    title.characters = section.props.title;
    title.fontSize = section.type === 'ReportHero' ? 64 : 36;
    title.fontName = { family: "Inter", style: "Bold" };
    title.fills = [{ type: 'SOLID', color: isDark ? hexToRgb('#ffffff') : textColor }];
    title.x = padding;
    title.y = padding;
    title.resize(frame.width - padding * 2, title.height);
    frame.appendChild(title);
  }

  // Add subtitle
  if (section.props?.subtitle) {
    const subtitle = figma.createText();
    subtitle.characters = section.props.subtitle;
    subtitle.fontSize = section.type === 'ReportHero' ? 24 : 18;
    subtitle.fontName = { family: "Inter", style: "Regular" };
    subtitle.fills = [{ type: 'SOLID', color: isDark ? { r: 1, g: 1, b: 1 } : hexToRgb('#6b7280') }];
    subtitle.x = padding;
    subtitle.y = padding + (section.type === 'ReportHero' ? 80 : 50);
    frame.appendChild(subtitle);
  }

  // Add type indicator
  const typeLabel = figma.createText();
  typeLabel.characters = `[${section.type}]`;
  typeLabel.fontSize = 12;
  typeLabel.fontName = { family: "Inter", style: "Medium" };
  typeLabel.fills = [{ type: 'SOLID', color: isDark ? { r: 0.8, g: 0.8, b: 0.8 } : hexToRgb('#9ca3af') }];
  typeLabel.x = frame.width - 200;
  typeLabel.y = 20;
  frame.appendChild(typeLabel);

  // Add placeholders for images
  if (section.placeholders) {
    await addPlaceholders(frame, section.placeholders, padding);
  }

  // Add specific content based on type
  switch (section.type) {
    case 'ImpactStatsGrid':
      await addStatsPlaceholders(frame, section.props?.stats || [], padding);
      break;
    case 'QuoteShowcase':
      await addQuotePlaceholder(frame, section.props, padding, isDark);
      break;
    case 'LeadershipMessage':
      await addLeadershipPlaceholder(frame, section.props, padding);
      break;
    case 'Timeline':
      await addTimelinePlaceholders(frame, section.props?.events || [], padding);
      break;
    case 'FinancialDonut':
      await addFinancialPlaceholder(frame, section.props, padding);
      break;
  }
}

// Add image placeholders
async function addPlaceholders(frame: FrameNode, placeholders: any, padding: number) {
  let xOffset = padding;
  const yOffset = 200;

  if (placeholders.photo || placeholders.backgroundImage) {
    const ph = placeholders.photo || placeholders.backgroundImage;
    const rect = figma.createRectangle();
    rect.name = ph.label || 'Image Placeholder';
    rect.resize(ph.width || 400, ph.height || 400);
    rect.x = xOffset;
    rect.y = yOffset;
    rect.fills = [{ type: 'SOLID', color: hexToRgb('#e5e7eb') }];
    rect.strokes = [{ type: 'SOLID', color: hexToRgb('#9ca3af') }];
    rect.strokeWeight = 2;
    rect.dashPattern = [10, 5];
    frame.appendChild(rect);

    // Add label
    const label = figma.createText();
    label.characters = ph.label || 'Drop image here';
    label.fontSize = 14;
    label.fontName = { family: "Inter", style: "Medium" };
    label.fills = [{ type: 'SOLID', color: hexToRgb('#6b7280') }];
    label.x = xOffset + (ph.width || 400) / 2 - 50;
    label.y = yOffset + (ph.height || 400) / 2 - 10;
    frame.appendChild(label);
  }

  if (placeholders.images) {
    for (let i = 0; i < placeholders.images.length && i < 4; i++) {
      const ph = placeholders.images[i];
      const rect = figma.createRectangle();
      rect.name = ph.label || `Image ${i + 1}`;
      rect.resize(ph.width || 300, ph.height || 200);
      rect.x = padding + (i % 2) * (ph.width + 20);
      rect.y = yOffset + Math.floor(i / 2) * (ph.height + 20);
      rect.fills = [{ type: 'SOLID', color: hexToRgb('#e5e7eb') }];
      rect.strokes = [{ type: 'SOLID', color: hexToRgb('#9ca3af') }];
      rect.strokeWeight = 1;
      rect.dashPattern = [5, 5];
      frame.appendChild(rect);
    }
  }
}

// Add stats placeholders
async function addStatsPlaceholders(frame: FrameNode, stats: any[], padding: number) {
  const cols = 3;
  const boxWidth = 200;
  const boxHeight = 120;
  const gap = 30;

  for (let i = 0; i < stats.length && i < 6; i++) {
    const stat = stats[i];
    const col = i % cols;
    const row = Math.floor(i / cols);

    const box = figma.createFrame();
    box.name = `Stat - ${stat.label}`;
    box.resize(boxWidth, boxHeight);
    box.x = padding + col * (boxWidth + gap);
    box.y = 120 + row * (boxHeight + gap);
    box.fills = [{ type: 'SOLID', color: hexToRgb('#ffffff') }];
    box.cornerRadius = 12;
    box.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 2 },
      radius: 8,
      visible: true,
      blendMode: 'NORMAL',
      spread: 0,
    }];

    // Value
    const value = figma.createText();
    value.characters = stat.value;
    value.fontSize = 32;
    value.fontName = { family: "Inter", style: "Bold" };
    value.fills = [{ type: 'SOLID', color: hexToRgb('#1e3a5f') }];
    value.x = 20;
    value.y = 20;
    box.appendChild(value);

    // Label
    const label = figma.createText();
    label.characters = stat.label;
    label.fontSize = 14;
    label.fontName = { family: "Inter", style: "Medium" };
    label.fills = [{ type: 'SOLID', color: hexToRgb('#6b7280') }];
    label.x = 20;
    label.y = 70;
    box.appendChild(label);

    frame.appendChild(box);
  }
}

// Add quote placeholder
async function addQuotePlaceholder(frame: FrameNode, props: any, padding: number, isDark: boolean) {
  const quote = figma.createText();
  quote.characters = `"${props?.quote || '[Add quote text here]'}"`;
  quote.fontSize = 28;
  quote.fontName = { family: "Inter", style: "Medium" };
  quote.fills = [{ type: 'SOLID', color: isDark ? hexToRgb('#ffffff') : hexToRgb('#1f2937') }];
  quote.x = padding;
  quote.y = 120;
  quote.resize(frame.width - padding * 2, 200);
  quote.textAutoResize = 'HEIGHT';
  frame.appendChild(quote);

  if (props?.author) {
    const author = figma.createText();
    author.characters = `— ${props.author}${props.role ? `, ${props.role}` : ''}`;
    author.fontSize = 16;
    author.fontName = { family: "Inter", style: "Regular" };
    author.fills = [{ type: 'SOLID', color: isDark ? hexToRgb('#d1d5db') : hexToRgb('#6b7280') }];
    author.x = padding;
    author.y = 280;
    frame.appendChild(author);
  }
}

// Add leadership placeholder
async function addLeadershipPlaceholder(frame: FrameNode, props: any, padding: number) {
  // Photo placeholder
  const photoRect = figma.createRectangle();
  photoRect.name = 'Leadership Photo';
  photoRect.resize(300, 400);
  photoRect.x = padding;
  photoRect.y = 120;
  photoRect.fills = [{ type: 'SOLID', color: hexToRgb('#e5e7eb') }];
  photoRect.cornerRadius = 8;
  frame.appendChild(photoRect);

  // Message area
  const message = figma.createText();
  message.characters = props?.message || '[Leadership message goes here]';
  message.fontSize = 16;
  message.fontName = { family: "Inter", style: "Regular" };
  message.fills = [{ type: 'SOLID', color: hexToRgb('#374151') }];
  message.x = padding + 340;
  message.y = 120;
  message.resize(frame.width - padding - 340 - padding, 350);
  message.textAutoResize = 'HEIGHT';
  frame.appendChild(message);

  // Name & role
  const nameText = figma.createText();
  nameText.characters = `${props?.name || '[Name]'}\n${props?.role || '[Role]'}`;
  nameText.fontSize = 14;
  nameText.fontName = { family: "Inter", style: "Medium" };
  nameText.fills = [{ type: 'SOLID', color: hexToRgb('#6b7280') }];
  nameText.x = padding;
  nameText.y = 540;
  frame.appendChild(nameText);
}

// Add timeline placeholders
async function addTimelinePlaceholders(frame: FrameNode, events: any[], padding: number) {
  const lineX = padding + 100;

  // Vertical line
  const line = figma.createRectangle();
  line.resize(4, frame.height - 200);
  line.x = lineX;
  line.y = 100;
  line.fills = [{ type: 'SOLID', color: hexToRgb('#e5e7eb') }];
  frame.appendChild(line);

  for (let i = 0; i < events.length && i < 7; i++) {
    const event = events[i];
    const y = 120 + i * 100;

    // Dot
    const dot = figma.createEllipse();
    dot.resize(16, 16);
    dot.x = lineX - 6;
    dot.y = y;
    dot.fills = [{ type: 'SOLID', color: hexToRgb('#7c3aed') }];
    frame.appendChild(dot);

    // Date
    const date = figma.createText();
    date.characters = event.date || `Month ${i + 1}`;
    date.fontSize = 12;
    date.fontName = { family: "Inter", style: "Bold" };
    date.fills = [{ type: 'SOLID', color: hexToRgb('#7c3aed') }];
    date.x = padding;
    date.y = y;
    frame.appendChild(date);

    // Title
    const title = figma.createText();
    title.characters = event.title || '[Event Title]';
    title.fontSize = 16;
    title.fontName = { family: "Inter", style: "Bold" };
    title.fills = [{ type: 'SOLID', color: hexToRgb('#1f2937') }];
    title.x = lineX + 30;
    title.y = y - 5;
    frame.appendChild(title);

    // Description
    const desc = figma.createText();
    desc.characters = event.description || '[Event description]';
    desc.fontSize = 14;
    desc.fontName = { family: "Inter", style: "Regular" };
    desc.fills = [{ type: 'SOLID', color: hexToRgb('#6b7280') }];
    desc.x = lineX + 30;
    desc.y = y + 20;
    frame.appendChild(desc);
  }
}

// Add financial placeholder
async function addFinancialPlaceholder(frame: FrameNode, props: any, padding: number) {
  // Donut chart placeholder
  const circle = figma.createEllipse();
  circle.resize(300, 300);
  circle.x = padding;
  circle.y = 150;
  circle.fills = [{ type: 'SOLID', color: hexToRgb('#e5e7eb') }];
  circle.strokes = [{ type: 'SOLID', color: hexToRgb('#1e3a5f') }];
  circle.strokeWeight = 40;
  frame.appendChild(circle);

  // Legend
  const segments = props?.segments || [];
  for (let i = 0; i < segments.length && i < 5; i++) {
    const seg = segments[i];
    const y = 150 + i * 50;

    // Color box
    const colorBox = figma.createRectangle();
    colorBox.resize(20, 20);
    colorBox.x = padding + 360;
    colorBox.y = y;
    colorBox.fills = [{ type: 'SOLID', color: hexToRgb(seg.color || '#6b7280') }];
    colorBox.cornerRadius = 4;
    frame.appendChild(colorBox);

    // Label
    const label = figma.createText();
    label.characters = `${seg.label} - ${seg.percentage || 0}%`;
    label.fontSize = 14;
    label.fontName = { family: "Inter", style: "Medium" };
    label.fills = [{ type: 'SOLID', color: hexToRgb('#374151') }];
    label.x = padding + 390;
    label.y = y;
    frame.appendChild(label);
  }
}

// Add component labels as a guide
function addComponentLabels(page: PageNode, sections: any[], spacing: number) {
  // Already labeled in frames
}

// Convert hex to RGB
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 1, g: 1, b: 1 };
}

// Send selection info to UI
function sendSelectionInfo() {
  const selection = figma.currentPage.selection;
  const info = selection.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    componentType: detectComponentType(node),
  }));
  figma.ui.postMessage({ type: 'selection-info', payload: info });
}

// Send pages info to UI
async function sendPagesInfo() {
  const pages: Array<{ id: string; name: string; childCount: number }> = [];

  for (const page of figma.root.children) {
    // With `documentAccess: "dynamic-page"`, pages must be explicitly loaded before accessing `page.children`.
    await page.loadAsync();
    pages.push({
      id: page.id,
      name: page.name,
      childCount: page.children.length,
    });
  }

  figma.ui.postMessage({ type: 'pages-info', payload: pages });
}

// Detect component type from node name or structure
function detectComponentType(node: SceneNode): string | null {
  const nameLower = node.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Check direct mappings
  for (const [key, value] of Object.entries(COMPONENT_MAPPINGS)) {
    if (nameLower.includes(key)) {
      return value;
    }
  }

  // Check if it's a component instance
  if (node.type === 'INSTANCE') {
    const mainComponent = (node as InstanceNode).mainComponent;
    if (mainComponent) {
      const componentName = mainComponent.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      for (const [key, value] of Object.entries(COMPONENT_MAPPINGS)) {
        if (componentName.includes(key)) {
          return value;
        }
      }
    }
  }

  return null;
}

// Export current selection
async function exportSelection() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      payload: 'Please select at least one frame or component to export'
    });
    return;
  }

  const exportData = await processNodes(selection);
  figma.ui.postMessage({ type: 'export-complete', payload: exportData });
}

// Export current page
async function exportCurrentPage() {
  const page = figma.currentPage;
  await page.loadAsync();
  const topLevelFrames = page.children.filter(
    node => node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE'
  );

  const exportData = await processNodes(topLevelFrames);
  exportData.pageName = page.name;
  figma.ui.postMessage({ type: 'export-complete', payload: exportData });
}

// Export all pages
async function exportAllPages() {
  const allPagesData: any[] = [];

  for (const page of figma.root.children) {
    await figma.setCurrentPageAsync(page);
    await page.loadAsync();
    const topLevelFrames = page.children.filter(
      node => node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE'
    );

    const pageData = await processNodes(topLevelFrames);
    pageData.pageName = page.name;
    allPagesData.push(pageData);
  }

  figma.ui.postMessage({ type: 'export-complete', payload: { pages: allPagesData } });
}

// Process nodes and extract component data
async function processNodes(nodes: readonly SceneNode[]): Promise<any> {
  const sections: any[] = [];
  const images: any[] = [];

  for (const node of nodes) {
    const processed = await processNode(node);
    if (processed) {
      if (processed.images) {
        images.push(...processed.images);
        delete processed.images;
      }
      sections.push(processed);
    }
  }

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    sections,
    images,
    metadata: {
      figmaFileId: figma.fileKey,
      pageName: figma.currentPage.name,
    }
  };
}

// Process individual node
async function processNode(node: SceneNode): Promise<any | null> {
  const componentType = detectComponentType(node);
  const baseData: any = {
    id: node.id,
    name: node.name,
    componentType: componentType || 'Section',
    order: getNodeOrder(node),
  };

  // Extract based on component type
  switch (componentType) {
    case 'ReportHero':
      return { ...baseData, ...await extractHeroData(node) };
    case 'ImpactStat':
    case 'ImpactStatsGrid':
      return { ...baseData, ...await extractStatsData(node) };
    case 'QuoteShowcase':
      return { ...baseData, ...extractQuoteData(node) };
    case 'LeadershipMessage':
      return { ...baseData, ...await extractLeadershipData(node) };
    case 'Timeline':
      return { ...baseData, ...extractTimelineData(node) };
    case 'StoryCard':
    case 'StoryGrid':
      return { ...baseData, ...await extractStoryData(node) };
    case 'PhotoGallery':
    case 'HeroGallery':
      return { ...baseData, ...await extractGalleryData(node) };
    case 'FinancialDonut':
    case 'DollarBreakdown':
      return { ...baseData, ...extractFinancialData(node) };
    case 'ServiceShowcase':
      return { ...baseData, ...extractServiceData(node) };
    default:
      return { ...baseData, ...await extractGenericSection(node) };
  }
}

// Get node order on page
function getNodeOrder(node: SceneNode): number {
  const parent = node.parent;
  if (parent && 'children' in parent) {
    return parent.children.indexOf(node as any);
  }
  return 0;
}

// Extract text from node tree
function extractText(node: SceneNode): string[] {
  const texts: string[] = [];

  if (node.type === 'TEXT') {
    texts.push((node as TextNode).characters);
  }

  if ('children' in node) {
    for (const child of (node as any).children) {
      texts.push(...extractText(child));
    }
  }

  return texts;
}

// Extract colors from node
function extractColors(node: SceneNode): string[] {
  const colors: string[] = [];

  if ('fills' in node && Array.isArray(node.fills)) {
    for (const fill of node.fills as Paint[]) {
      if (fill.type === 'SOLID' && fill.visible !== false) {
        const { r, g, b } = fill.color;
        colors.push(`rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`);
      }
    }
  }

  return colors;
}

// Extract hero section data
async function extractHeroData(node: SceneNode): Promise<any> {
  const texts = extractText(node);
  const images = await extractImages(node);

  return {
    type: 'hero',
    title: texts[0] || '',
    subtitle: texts[1] || '',
    backgroundImage: images[0]?.url || null,
    images,
  };
}

// Extract stats data
async function extractStatsData(node: SceneNode): Promise<any> {
  const stats: any[] = [];
  const texts = extractText(node);

  // Try to pair values with labels
  for (let i = 0; i < texts.length; i += 2) {
    if (texts[i]) {
      stats.push({
        value: texts[i],
        label: texts[i + 1] || '',
      });
    }
  }

  return {
    type: 'stats',
    stats,
  };
}

// Extract quote data
function extractQuoteData(node: SceneNode): any {
  const texts = extractText(node);

  return {
    type: 'quote',
    quote: texts[0] || '',
    author: texts[1] || '',
    role: texts[2] || '',
  };
}

// Extract leadership message data
async function extractLeadershipData(node: SceneNode): Promise<any> {
  const texts = extractText(node);
  const images = await extractImages(node);

  return {
    type: 'leadership',
    name: texts[0] || '',
    role: texts[1] || '',
    message: texts.slice(2).join('\n\n') || '',
    photo: images[0]?.url || null,
    images,
  };
}

// Extract timeline data
function extractTimelineData(node: SceneNode): any {
  const events: any[] = [];
  const texts = extractText(node);

  // Try to extract year/event pairs
  for (let i = 0; i < texts.length; i += 2) {
    if (texts[i]) {
      events.push({
        year: texts[i],
        title: texts[i + 1] || '',
      });
    }
  }

  return {
    type: 'timeline',
    events,
  };
}

// Extract story data
async function extractStoryData(node: SceneNode): Promise<any> {
  const texts = extractText(node);
  const images = await extractImages(node);

  return {
    type: 'story',
    title: texts[0] || '',
    excerpt: texts[1] || '',
    category: texts[2] || 'community',
    image: images[0]?.url || null,
    images,
  };
}

// Extract gallery data
async function extractGalleryData(node: SceneNode): Promise<any> {
  const images = await extractImages(node);
  const texts = extractText(node);

  return {
    type: 'gallery',
    title: texts[0] || 'Gallery',
    images: images.map((img, i) => ({
      ...img,
      caption: texts[i + 1] || '',
    })),
  };
}

// Extract financial data
function extractFinancialData(node: SceneNode): any {
  const texts = extractText(node);
  const colors = extractColors(node);

  // Try to extract percentages and labels
  const segments: any[] = [];
  for (let i = 0; i < texts.length; i += 2) {
    const value = texts[i];
    const label = texts[i + 1];
    if (value && label) {
      segments.push({
        value: parseFloat(value.replace(/[^0-9.]/g, '')) || 0,
        label,
        color: colors[Math.floor(i / 2)] || undefined,
      });
    }
  }

  return {
    type: 'financial',
    segments,
  };
}

// Extract service data
function extractServiceData(node: SceneNode): any {
  const texts = extractText(node);

  return {
    type: 'services',
    services: texts.map(text => ({ name: text })),
  };
}

// Extract generic section data
async function extractGenericSection(node: SceneNode): Promise<any> {
  const texts = extractText(node);
  const images = await extractImages(node);
  const colors = extractColors(node);

  return {
    type: 'section',
    title: texts[0] || node.name,
    content: texts.slice(1).join('\n\n'),
    backgroundColor: colors[0] || null,
    images,
  };
}

// Extract images from node
async function extractImages(node: SceneNode): Promise<any[]> {
  const images: any[] = [];

  async function processImageNode(n: SceneNode) {
    // Check for image fills
    if ('fills' in n && Array.isArray(n.fills)) {
      for (const fill of n.fills as Paint[]) {
        if (fill.type === 'IMAGE' && fill.imageHash) {
          try {
            const image = figma.getImageByHash(fill.imageHash);
            if (image) {
              const bytes = await image.getBytesAsync();
              const base64 = figma.base64Encode(bytes);
              images.push({
                id: fill.imageHash,
                name: n.name,
                base64: `data:image/png;base64,${base64}`,
                width: 'width' in n ? n.width : 0,
                height: 'height' in n ? n.height : 0,
              });
            }
          } catch (e) {
            console.error('Failed to export image:', e);
          }
        }
      }
    }

    // Recursively process children
    if ('children' in n) {
      for (const child of (n as any).children) {
        await processImageNode(child);
      }
    }
  }

  await processImageNode(node);
  return images;
}

// Publish to API
async function publishToAPI(data: any) {
  figma.ui.postMessage({
    type: 'publish-status',
    payload: { status: 'publishing', message: 'Sending to server...' }
  });

  // The actual API call happens in the UI (which has network access)
  figma.ui.postMessage({
    type: 'do-publish',
    payload: data
  });
}

// Listen for selection changes
figma.on('selectionchange', () => {
  sendSelectionInfo();
});

// Initial load
sendSelectionInfo();
sendPagesInfo();
