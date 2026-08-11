export interface FontItem {
  name: string;
  category: 'Sans-Serif' | 'Serif' | 'Display / Bold' | 'Monospace' | 'Manuscrito / Elegante' | 'Modern & Minimal';
  weights?: string;
  popularFor?: string;
}

export const FONTS_CATALOG: FontItem[] = [
  // --- SANS-SERIF & MODERN CORPORATE (50+) ---
  { name: 'Plus Jakarta Sans', category: 'Sans-Serif', popularFor: 'SaaS, UI Corporativo & Dashboards' },
  { name: 'Inter', category: 'Sans-Serif', popularFor: 'Interface limpa e legibilidade digital' },
  { name: 'Poppins', category: 'Sans-Serif', popularFor: 'Design moderno, jovem e dinâmico' },
  { name: 'Montserrat', category: 'Sans-Serif', popularFor: 'Títulos elegantes e corporativos' },
  { name: 'Roboto', category: 'Sans-Serif', popularFor: 'Padrão Android/Google limpo e versátil' },
  { name: 'Open Sans', category: 'Sans-Serif', popularFor: 'Excelente leitura de texto longo' },
  { name: 'Lato', category: 'Sans-Serif', popularFor: 'Design amigável e profissional' },
  { name: 'Nunito', category: 'Sans-Serif', popularFor: 'Cantos suaves e arredondados' },
  { name: 'Work Sans', category: 'Sans-Serif', popularFor: 'Tipografia responsiva e sólida' },
  { name: 'Raleway', category: 'Sans-Serif', popularFor: 'Estilo sofisticado com traços finos' },
  { name: 'Outfit', category: 'Sans-Serif', popularFor: 'Geométrico moderno de alto impacto' },
  { name: 'Manrope', category: 'Sans-Serif', popularFor: 'Semi-geométrico corporativo premium' },
  { name: 'Lexend', category: 'Sans-Serif', popularFor: 'Otimizado para leitura rápida e clareza' },
  { name: 'Space Grotesk', category: 'Sans-Serif', popularFor: 'Estilo tech, futurista e ousado' },
  { name: 'DM Sans', category: 'Sans-Serif', popularFor: 'Minimalista e de alta precisão' },
  { name: 'Public Sans', category: 'Sans-Serif', popularFor: 'Design governamental e institucional' },
  { name: 'Urbanist', category: 'Sans-Serif', popularFor: 'Geométrico ultra-moderno' },
  { name: 'Red Hat Display', category: 'Sans-Serif', popularFor: 'Branding tecnológico e enterprise' },
  { name: 'Barlow', category: 'Sans-Serif', popularFor: 'Inspirado em sinalização e navegação' },
  { name: 'Josefin Sans', category: 'Sans-Serif', popularFor: 'Inspirado no estilo vintage dos anos 1920' },
  { name: 'Cabin', category: 'Sans-Serif', popularFor: 'Humanista moderno com bordas bem suaves' },
  { name: 'Hind', category: 'Sans-Serif', popularFor: 'Desenvolvido especificamente para ecrãs' },
  { name: 'Noto Sans', category: 'Sans-Serif', popularFor: 'Compatibilidade internacional total' },
  { name: 'Questrial', category: 'Sans-Serif', popularFor: 'Minimalismo circular e elegante' },
  { name: 'Sora', category: 'Sans-Serif', popularFor: 'Projetado para apps fintech e Web3' },
  { name: 'Rubik', category: 'Sans-Serif', popularFor: 'Formas suavemente arredondadas' },
  { name: 'Ubuntu', category: 'Sans-Serif', popularFor: 'Inspirado no ecossistema Linux/Tech' },
  { name: 'Quicksand', category: 'Sans-Serif', popularFor: 'Display arredondado e amigável' },
  { name: 'Fira Sans', category: 'Sans-Serif', popularFor: 'Criado pela Mozilla para alta legibilidade' },
  { name: 'Kanit', category: 'Sans-Serif', popularFor: 'Corte moderno e futurista' },
  { name: 'Mulish', category: 'Sans-Serif', popularFor: 'Desenhado para apps móveis modernas' },
  { name: 'Barlow Semi Condensed', category: 'Sans-Serif', popularFor: 'Tabelas densas e dashboards' },
  { name: 'Chakra Petch', category: 'Sans-Serif', popularFor: 'Corte robótico e aeroespacial' },
  { name: 'Exo 2', category: 'Sans-Serif', popularFor: 'Design futurista e dinâmico' },
  { name: 'Rajdhani', category: 'Sans-Serif', popularFor: 'Títulos condensados para engenharia' },
  { name: 'Titillium Web', category: 'Sans-Serif', popularFor: 'Criado na Academia de Belas Artes' },
  { name: 'Overpass', category: 'Sans-Serif', popularFor: 'Inspirado nas autoestradas americanas' },
  { name: 'Asap', category: 'Sans-Serif', popularFor: 'Mesma largura nos estilos normal e negrito' },
  { name: 'Assistant', category: 'Sans-Serif', popularFor: 'Interface limpa sem serifas' },
  { name: 'Muli', category: 'Sans-Serif', popularFor: 'Minimalista para apresentações' },
  { name: 'Cairo', category: 'Sans-Serif', popularFor: 'Excelente para textos multilíngues' },
  { name: 'Albert Sans', category: 'Sans-Serif', popularFor: 'Inspirado na tradição moderna nórdica' },
  { name: 'Plus Jakarta Display', category: 'Sans-Serif', popularFor: 'Títulos e cabeçalhos em destaque' },
  { name: 'Figtree', category: 'Sans-Serif', popularFor: 'Design amigável e equilibrado' },
  { name: 'Be Vietnam Pro', category: 'Sans-Serif', popularFor: 'Projetado para marcas globais' },
  { name: 'Plus Jakarta Text', category: 'Sans-Serif', popularFor: 'Leitura fluida em dispositivos móveis' },
  { name: 'Golos Text', category: 'Sans-Serif', popularFor: 'Especial para portais de notícias e CRM' },
  { name: 'Schibsted Grotesk', category: 'Sans-Serif', popularFor: 'Jornalismo digital e relatórios' },
  { name: 'Rethink Sans', category: 'Sans-Serif', popularFor: 'Interação e botões de alta conversão' },
  { name: 'Instrument Sans', category: 'Sans-Serif', popularFor: 'Elegância em ferramentas de produtividade' },

  // --- SERIF & EDITORIAL LUXURY (45+) ---
  { name: 'Playfair Display', category: 'Serif', popularFor: 'Títulos luxuosos, moda e relatórios' },
  { name: 'Merriweather', category: 'Serif', popularFor: 'Leitura confortável de documentos e artigos' },
  { name: 'Lora', category: 'Serif', popularFor: 'Estilo poético com excelente fluidez' },
  { name: 'PT Serif', category: 'Serif', popularFor: 'Publicações oficiais e jurídicas' },
  { name: 'EB Garamond', category: 'Serif', popularFor: 'A essência clássica da tipografia' },
  { name: 'Cormorant Garamond', category: 'Serif', popularFor: 'Serifa requintada para marcas premium' },
  { name: 'Cinzel', category: 'Serif', popularFor: 'Inspirado na epigrafia romana monumental' },
  { name: 'Bodoni Moda', category: 'Serif', popularFor: 'Estilo editorial de alta costura' },
  { name: 'Crimson Text', category: 'Serif', popularFor: 'Produção literária e académica' },
  { name: 'Libre Baskerville', category: 'Serif', popularFor: 'Otimizado para e-books e PDFs' },
  { name: 'Noto Serif', category: 'Serif', popularFor: 'Universal e imponente' },
  { name: 'Spectral', category: 'Serif', popularFor: 'Especialmente para ecrãs de alta resolução' },
  { name: 'Prata', category: 'Serif', popularFor: 'Elegância com curvas suaves' },
  { name: 'Bitter', category: 'Serif', popularFor: 'Slab-serif projetado para leitura digital' },
  { name: 'Arvo', category: 'Serif', popularFor: 'Geométrico slab-serif bem estruturado' },
  { name: 'Domine', category: 'Serif', popularFor: 'Projetado para jornais digitais' },
  { name: 'Volkhov', category: 'Serif', popularFor: 'Robusto para relatórios financeiros' },
  { name: 'Marcellus', category: 'Serif', popularFor: 'Inspirado na antiguidade clássica' },
  { name: 'Newsreader', category: 'Serif', popularFor: 'Otimizado para grandes volumes de texto' },
  { name: 'Fraunces', category: 'Serif', popularFor: 'Serifa expressiva estilo retró-contemporâneo' },
  { name: 'Alegreya', category: 'Serif', popularFor: 'Dinâmica e ritmo na leitura' },
  { name: 'Playfair', category: 'Serif', popularFor: 'Versão modernizada com curvas refinadas' },
  { name: 'Cormorant', category: 'Serif', popularFor: 'Curvas artísticas e delicadas' },
  { name: 'Abril Fatface', category: 'Serif', popularFor: 'Inspirado nos cartazes do século XIX' },
  { name: 'Zilla Slab', category: 'Serif', popularFor: 'Slab-serif oficial da Mozilla' },
  { name: 'Frank Ruhl Libre', category: 'Serif', popularFor: 'Tipografia editorial clássica' },
  { name: 'Rozha One', category: 'Serif', popularFor: 'Grande contraste para títulos de topo' },
  { name: 'BioRhyme', category: 'Serif', popularFor: 'Slab-serif expressivo e amplo' },
  { name: 'Cardo', category: 'Serif', popularFor: 'Utilizado por linguistas e historiadores' },
  { name: 'Coustard', category: 'Serif', popularFor: 'Slab-serif equilibrado para relatórios' },
  { name: 'Vollkorn', category: 'Serif', popularFor: 'Robusto e com grande presença visual' },
  { name: 'Gentium Plus', category: 'Serif', popularFor: 'Legibilidade em diversos alfabetos' },
  { name: 'Literata', category: 'Serif', popularFor: 'Desenhada para a Google Play Livros' },
  { name: 'Chivo Serif', category: 'Serif', popularFor: 'Combinação de elegância e impacto' },
  { name: 'Young Serif', category: 'Serif', popularFor: 'Formas arredondadas e vintage' },
  { name: 'Castoro', category: 'Serif', popularFor: 'Especial para publicações académicas' },
  { name: 'Besley', category: 'Serif', popularFor: 'Slab-serif amigável e charmoso' },
  { name: 'Pinyon Script', category: 'Serif', popularFor: 'Caligrafia formal com inclinação de luxo' },
  { name: 'Piazzolla', category: 'Serif', popularFor: 'Inspirada em partituras e música clássica' },
  { name: 'Alice', category: 'Serif', popularFor: 'Estilo de conto de fadas e fantasia' },
  { name: 'DM Serif Display', category: 'Serif', popularFor: 'Sólida para títulos de relatórios' },
  { name: 'DM Serif Text', category: 'Serif', popularFor: 'Serifa compacta e legível' },
  { name: 'Baskervville', category: 'Serif', popularFor: 'Revival da célebre Baskerville histórica' },
  { name: 'Faustina', category: 'Serif', popularFor: 'Projetada para publicações periódicas' },
  { name: 'Tinos', category: 'Serif', popularFor: 'Métrica equivalente à Times New Roman' },

  // --- DISPLAY & BOLD HEADLINES (45+) ---
  { name: 'Bebas Neue', category: 'Display / Bold', popularFor: 'Títulos em maiúsculas de alto impacto' },
  { name: 'Anton', category: 'Display / Bold', popularFor: 'Font de impacto em estilo publicitário' },
  { name: 'Syne', category: 'Display / Bold', popularFor: 'Design artístico e vanguardista' },
  { name: 'Archivo Black', category: 'Display / Bold', popularFor: 'Massiva para cartazes e grandes números' },
  { name: 'Alfa Slab One', category: 'Display / Bold', popularFor: 'Estilo pesadíssimo e chamativo' },
  { name: 'Fjalla One', category: 'Display / Bold', popularFor: 'Condensada para banners e KPI cards' },
  { name: 'Righteous', category: 'Display / Bold', popularFor: 'Estilo sci-fi e retro-futurista' },
  { name: 'Unbounded', category: 'Display / Bold', popularFor: 'Expandida e sem limites gráficos' },
  { name: 'Russo One', category: 'Display / Bold', popularFor: 'Bordas arrojadas e visual forte' },
  { name: 'Bungee', category: 'Display / Bold', popularFor: 'Inspirado em letreiros verticais urbanos' },
  { name: 'Changa', category: 'Display / Bold', popularFor: 'Blocos geométricos marcantes' },
  { name: 'League Spartan', category: 'Display / Bold', popularFor: 'Geométrico arrojado e moderno' },
  { name: 'Cabinet Grotesk', category: 'Display / Bold', popularFor: 'Tipografia de marca contemporânea' },
  { name: 'Bricolage Grotesque', category: 'Display / Bold', popularFor: 'Inspirada na arquitetura brutalista' },
  { name: 'Titan One', category: 'Display / Bold', popularFor: 'Letras volumosas e arredondadas' },
  { name: 'Staatliches', category: 'Display / Bold', popularFor: 'Proporções limpas e imponentes' },
  { name: 'Permanent Marker', category: 'Display / Bold', popularFor: 'Efeito marcador manual realista' },
  { name: 'Luckiest Guy', category: 'Display / Bold', popularFor: 'Divertido e arrojado para gamificação' },
  { name: 'Cinzel Decorative', category: 'Display / Bold', popularFor: 'Letras capitulares ornamentadas' },
  { name: 'Concert One', category: 'Display / Bold', popularFor: '3D ligeiro e presença escultural' },
  { name: 'Patua One', category: 'Display / Bold', popularFor: 'Slab-serif suave para cabeçalhos' },
  { name: 'Fredoka', category: 'Display / Bold', popularFor: 'Arredondada, fofa e descontraída' },
  { name: 'Paytone One', category: 'Display / Bold', popularFor: 'Casual com peso de destaque' },
  { name: 'Lobster', category: 'Display / Bold', popularFor: 'Muito popular em logótipos e marcas' },
  { name: 'Shrikhand', category: 'Display / Bold', popularFor: 'Inspirada nos murais artesanais indianos' },
  { name: 'Chonburi', category: 'Display / Bold', popularFor: 'Contraste dramático e fluido' },
  { name: 'Kalam', category: 'Display / Bold', popularFor: 'Inspirada em escrita com caneta caligráfica' },
  { name: 'Lilita One', category: 'Display / Bold', popularFor: 'Gorda, amigável e com personalidade' },
  { name: 'Passion One', category: 'Display / Bold', popularFor: 'Condensada com cantos arredondados' },
  { name: 'Black Ops One', category: 'Display / Bold', popularFor: 'Estilo militar e stencil técnico' },
  { name: 'Press Start 2P', category: 'Display / Bold', popularFor: 'Pixel art dos videojogos dos anos 80' },
  { name: 'Silkscreen', category: 'Display / Bold', popularFor: 'Ecrãs retro e estética de código' },
  { name: 'Major Mono Display', category: 'Display / Bold', popularFor: 'Monocromática abstrata e artística' },
  { name: 'Monoton', category: 'Display / Bold', popularFor: 'Linhas múltiplas no estilo néon anos 70' },
  { name: 'Audiowide', category: 'Display / Bold', popularFor: 'Tecnológica e temática espacial' },
  { name: 'Orbitron', category: 'Display / Bold', popularFor: 'Geométrica futurista para interfaces de controlo' },
  { name: 'Electrolize', category: 'Display / Bold', popularFor: 'Visual eletrónico e robótico' },
  { name: 'Teko', category: 'Display / Bold', popularFor: 'Condensada para KPIs e balancetes' },
  { name: 'Saira Stencil One', category: 'Display / Bold', popularFor: 'Corte industrial para embalagens' },
  { name: 'Rubik Mono One', category: 'Display / Bold', popularFor: 'Bloco de código maciço' },
  { name: 'Bowlby One SC', category: 'Display / Bold', popularFor: 'Rústica e marcante' },
  { name: 'Macondo', category: 'Display / Bold', popularFor: 'Inspirada no realismo mágico' },
  { name: 'Dela Gothic One', category: 'Display / Bold', popularFor: 'Gótica ultra-pesada para títulos' },
  { name: 'Platypi', category: 'Display / Bold', popularFor: 'Orgânica, viva e contemporânea' },
  { name: 'Honk', category: 'Display / Bold', popularFor: 'Estilo gradiente e tridimensional' },

  // --- MONOSPACE & CODE / FINTECH (30+) ---
  { name: 'JetBrains Mono', category: 'Monospace', popularFor: 'Código legível com ligaduras perfeitas' },
  { name: 'Fira Code', category: 'Monospace', popularFor: 'Ligaduras de programação e matemática' },
  { name: 'Source Code Pro', category: 'Monospace', popularFor: 'Desenvolvida pela Adobe para programadores' },
  { name: 'Space Mono', category: 'Monospace', popularFor: 'Visual editorial monocromático' },
  { name: 'Inconsolata', category: 'Monospace', popularFor: 'Clássico para terminais e finanças' },
  { name: 'Roboto Mono', category: 'Monospace', popularFor: 'Alinhamento numérico impecável em tabelas' },
  { name: 'IBM Plex Mono', category: 'Monospace', popularFor: 'Projetada pela IBM para dados complexos' },
  { name: 'Anonymous Pro', category: 'Monospace', popularFor: 'Criada para caracteres de código e números' },
  { name: 'Share Tech Mono', category: 'Monospace', popularFor: 'Inspirada em equipamentos militares' },
  { name: 'Cousine', category: 'Monospace', popularFor: 'Equivalente à Courier New em legibilidade' },
  { name: 'VT323', category: 'Monospace', popularFor: 'Estilo terminal clássico CRT' },
  { name: 'Cutive Mono', category: 'Monospace', popularFor: 'Inspirada nas velhas máquinas de escrever' },
  { name: 'Nova Mono', category: 'Monospace', popularFor: 'Design experimental e futurista' },
  { name: 'Overpass Mono', category: 'Monospace', popularFor: 'Relatórios de sistemas e métricas' },
  { name: 'Red Hat Mono', category: 'Monospace', popularFor: 'Consola de servidores e Cloud' },
  { name: 'Ubuntu Sans Mono', category: 'Monospace', popularFor: 'Clara e proporcional para tabelas' },
  { name: 'Syne Mono', category: 'Monospace', popularFor: 'Toque artístico em listas técnicas' },
  { name: 'Spline Sans Mono', category: 'Monospace', popularFor: 'Projetada para ferramentas de desenvolvedor' },
  { name: 'B612 Mono', category: 'Monospace', popularFor: 'Desenhada pela Airbus para ecrãs de aviação' },
  { name: 'Chivo Mono', category: 'Monospace', popularFor: 'Tabelas financeiras e números de faturação' },
  { name: 'Fragment Mono', category: 'Monospace', popularFor: 'Efeito código escuro e moderno' },
  { name: 'Commit Mono', category: 'Monospace', popularFor: 'Otimizada para leitura de algoritmos' },
  { name: 'Geist Mono', category: 'Monospace', popularFor: 'Minimalismo técnico para dashboards' },
  { name: 'Martian Mono', category: 'Monospace', popularFor: 'Matriz densa para estatísticas' },
  { name: 'MFR Adapt Mono', category: 'Monospace', popularFor: 'Leitura de extratos e logs de vendas' },
  { name: 'Xanh Mono', category: 'Monospace', popularFor: 'Monospace com serifas delicadas' },
  { name: 'Sometype Mono', category: 'Monospace', popularFor: 'Design clean para entradas de dados' },
  { name: 'PT Mono', category: 'Monospace', popularFor: 'Ideal para preenchimento de formulários' },
  { name: 'Nanum Gothic Coding', category: 'Monospace', popularFor: 'Estrutura firme e alinhada' },
  { name: 'Major Mono', category: 'Monospace', popularFor: 'Formas geométricas de coleção' },

  // --- MANUSCRITO, CALIGRAFIA & ELEGANTE (30+) ---
  { name: 'Dancing Script', category: 'Manuscrito / Elegante', popularFor: 'Assinaturas e mensagens personalizadas' },
  { name: 'Pacifico', category: 'Manuscrito / Elegante', popularFor: 'Estilo surfista e descontraído dos anos 50' },
  { name: 'Great Vibes', category: 'Manuscrito / Elegante', popularFor: 'Caligrafia formal de convites e diplomas' },
  { name: 'Caveat', category: 'Manuscrito / Elegante', popularFor: 'Notas manuscritas e apontamentos' },
  { name: 'Satisfy', category: 'Manuscrito / Elegante', popularFor: 'Fluida e com toque pessoal carismático' },
  { name: 'Sacramento', category: 'Manuscrito / Elegante', popularFor: 'Linha fina contínua e sofisticada' },
  { name: 'Alex Brush', category: 'Manuscrito / Elegante', popularFor: 'Desenho a pincel clássico e limpo' },
  { name: 'Shadows Into Light', category: 'Manuscrito / Elegante', popularFor: 'Letra pessoal rápida com marcador' },
  { name: 'Allura', category: 'Manuscrito / Elegante', popularFor: 'Feminina, fluida e luxuosa' },
  { name: 'Amatic SC', category: 'Manuscrito / Elegante', popularFor: 'Manuscrita alta em maiúsculas' },
  { name: 'Bad Script', category: 'Manuscrito / Elegante', popularFor: 'Estilo diário pessoal' },
  { name: 'Kaushan Script', category: 'Manuscrito / Elegante', popularFor: 'Rústica com excelente textura' },
  { name: 'Marck Script', category: 'Manuscrito / Elegante', popularFor: 'Escrita com caneta feltro' },
  { name: 'Parisienne', category: 'Manuscrito / Elegante', popularFor: 'Inspirada no charme de Paris' },
  { name: 'Courgette', category: 'Manuscrito / Elegante', popularFor: 'Itálico suave e muito legível' },
  { name: 'Tangerine', category: 'Manuscrito / Elegante', popularFor: 'Caligrafia alta e extremamente fina' },
  { name: 'Yellowtail', category: 'Manuscrito / Elegante', popularFor: 'Retro americana com pincel médio' },
  { name: 'Damion', category: 'Manuscrito / Elegante', popularFor: 'Estilo casual dos anos 50' },
  { name: 'Grand Hotel', category: 'Manuscrito / Elegante', popularFor: 'Inspirada no filme de 1932' },
  { name: 'Homemade Apple', category: 'Manuscrito / Elegante', popularFor: 'Receita escrita à mão' },
  { name: 'Nothing You Could Do', category: 'Manuscrito / Elegante', popularFor: 'Escrita a caneta esferográfica' },
  { name: 'Reenie Beanie', category: 'Manuscrito / Elegante', popularFor: 'Post-it rápido e informal' },
  { name: 'La Belle Aurore', category: 'Manuscrito / Elegante', popularFor: 'Expressiva e artística' },
  { name: 'Herr Von Muellerhoff', category: 'Manuscrito / Elegante', popularFor: 'Estilo vitoriano e caligráfico' },
  { name: 'Monsieur La Doulaise', category: 'Manuscrito / Elegante', popularFor: 'Caligrafia de época ornamentada' },
  { name: 'WindSong', category: 'Manuscrito / Elegante', popularFor: 'Fluida como o vento' },
  { name: 'Charm', category: 'Manuscrito / Elegante', popularFor: 'Elegância com curvas suaves' },
  { name: 'Kenia', category: 'Manuscrito / Elegante', popularFor: 'Stencil artesanal único' },
  { name: 'Waterfall', category: 'Manuscrito / Elegante', popularFor: 'Movimento natural e continuo' },
  { name: 'Arizonia', category: 'Manuscrito / Elegante', popularFor: 'Traços caligráficos com variação de pressão' }
];

// Map of pre-loaded or dynamically loaded font families
const loadedFontsSet = new Set<string>();

/**
 * Loads a Google Font dynamically by name into the document <head>
 */
export function loadGoogleFont(fontName: string): void {
  if (!fontName || loadedFontsSet.has(fontName)) return;

  try {
    const formattedName = fontName.replace(/ /g, '+');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap`;
    document.head.appendChild(link);
    loadedFontsSet.add(fontName);
  } catch (err) {
    console.error('Erro ao carregar fonte Google:', fontName, err);
  }
}

/**
 * Applies a global font family to the body or specified root element
 */
export function applyGlobalFont(fontName: string): void {
  loadGoogleFont(fontName);
  document.documentElement.style.setProperty('--font-sans', `"${fontName}", sans-serif`);
  document.body.style.fontFamily = `"${fontName}", sans-serif`;
  localStorage.setItem('app_active_font', fontName);
}

/**
 * Get initial stored font
 */
export function getSavedFont(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('app_active_font') || 'Plus Jakarta Sans';
  }
  return 'Plus Jakarta Sans';
}
