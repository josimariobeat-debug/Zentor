// Mocked data for Zentor clone
export const currentUser = {
  name: "Vitrinne Clássica",
  initials: "VC",
  email: "contato@vitrinneclassica.com",
  plan: "Pro",
};

export const installedApps = [
  {
    id: "stories-videos",
    name: "Stories Vídeos",
    type: "SCRIPT EXTERNO",
    description: "Crie e gerencie stories e vídeos para sua loja",
    status: "ativa",
    expiresInDays: 7,
  },
];

export const storeApps = [
  {
    id: "stories-videos",
    name: "Stories Vídeos",
    type: "SCRIPT EXTERNO",
    description: "Crie e gerencie stories e vídeos com player flutuante e carrossel na sua loja.",
    price: "R$ 29,90/mês",
    installed: true,
  },
  {
    id: "avaliacoes-pro",
    name: "Avaliações Pro",
    type: "SCRIPT EXTERNO",
    description: "Colete e exiba avaliações verificadas dos seus clientes com fotos e vídeos.",
    price: "R$ 19,90/mês",
    installed: false,
  },
  {
    id: "popup-conversao",
    name: "Pop-up de Conversão",
    type: "SCRIPT EXTERNO",
    description: "Pop-ups inteligentes baseados em comportamento para aumentar conversão.",
    price: "R$ 14,90/mês",
    installed: false,
  },
  {
    id: "frete-tempo-real",
    name: "Frete em Tempo Real",
    type: "INTEGRAÇÃO",
    description: "Calcule fretes em tempo real direto na página do produto.",
    price: "R$ 24,90/mês",
    installed: false,
  },
  {
    id: "whatsapp-button",
    name: "WhatsApp Button",
    type: "SCRIPT EXTERNO",
    description: "Botão flutuante de WhatsApp com mensagens personalizadas por página.",
    price: "Grátis",
    installed: false,
  },
  {
    id: "timer-promo",
    name: "Timer Promocional",
    type: "SCRIPT EXTERNO",
    description: "Contador regressivo para criar urgência em promoções e lançamentos.",
    price: "R$ 9,90/mês",
    installed: false,
  },
];

export const tutorials = [
  { id: 1, title: "Como instalar um app na sua loja", duration: "3 min", category: "Começando" },
  { id: 2, title: "Configurando Stories Vídeos pela primeira vez", duration: "6 min", category: "Stories Vídeos" },
  { id: 3, title: "Upload de mídias pelo celular via QR Code", duration: "4 min", category: "Stories Vídeos" },
  { id: 4, title: "Como gerenciar sua assinatura", duration: "2 min", category: "Conta" },
  { id: 5, title: "Personalizando a aparência do widget", duration: "5 min", category: "Stories Vídeos" },
  { id: 6, title: "Integrando com sua plataforma de e-commerce", duration: "7 min", category: "Integrações" },
];

export const subscriptions = [
  {
    id: "sub-1",
    app: "Stories Vídeos",
    plan: "Mensal",
    price: "R$ 29,90",
    nextBilling: "18/07/2025",
    status: "ativa",
  },
];

export const sampleStories = [
  {
    id: "s1",
    title: "Coleção Verão 2025",
    thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=400&fit=crop",
    format: "video",
    active: true,
    views: 1284,
  },
  {
    id: "s2",
    title: "Promoção relâmpago",
    thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop",
    format: "video",
    active: true,
    views: 932,
  },
  {
    id: "s3",
    title: "Lookbook outono",
    thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop",
    format: "image",
    active: false,
    views: 421,
  },
  {
    id: "s4",
    title: "Bastidores fotos",
    thumbnail: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=400&fit=crop",
    format: "video",
    active: true,
    views: 654,
  },
];

export const sidebarNav = [
  { key: "meus-apps", label: "Meus apps", icon: "LayoutGrid", path: "/" },
  { key: "loja", label: "Loja de apps", icon: "Store", path: "/loja" },
  { key: "tutoriais", label: "Tutoriais", icon: "GraduationCap", path: "/tutoriais" },
  { key: "feedback", label: "Feedback", icon: "MessageSquare", path: "/feedback" },
  { key: "assinaturas", label: "Assinaturas", icon: "CreditCard", path: "/assinaturas" },
  { key: "perfil", label: "Perfil", icon: "User", path: "/perfil" },
];
