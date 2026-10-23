/* Contenido inicial de la landing. El módulo administrativo guarda una copia
   editada en data/content.json; este archivo solo se usa si esa copia no existe. */
window.DEFAULT_CONTENT = {
  brand: {
    name: "CupoPlus",
    tagline: "Compra a cuotas con Addi y Sistecrédito",
    logo: "",
    whatsapp: "573505457420",
    city: "Colombia"
  },
  marquee: [
    "Aliado oficial Addi: usa tu cupo hoy mismo",
    "Descuento exclusivo pagando con Addi",
    "Arma tu pedido con varios productos y págalo en una sola solicitud",
    "Asesoría por WhatsApp de lunes a sábado",
    "Sin papeleos: la aprobación la hace la plataforma en minutos",
    "Envíos a toda Colombia"
  ],
  hero: {
    eyebrow: "Aliado oficial Addi · Sistecrédito",
    title: "Lo que necesitas hoy,",
    highlight: "en cuotas que sí caben.",
    subtitle: "Elige uno o varios productos, paga con tu cupo Addi o Sistecrédito y recibe en casa. Pagando con Addi tienes un descuento exclusivo.",
    ctaPrimary: "Ver productos",
    ctaSecondary: "Simular mis cuotas",
    image: ""
  },
  promo: {
    kicker: "Aliado oficial Addi",
    title: "¿Tienes cupo Addi?",
    highlight: "Conviértelo hoy en lo que necesitas.",
    subtitle: "Dinos cuánto cupo tienes y en minutos te armamos un pedido a tu medida, con descuento exclusivo por pagar con Addi. Sin filas, sin papeleos.",
    cta: "Usar mi cupo Addi ahora",
    message: "Hola 👋 Tengo cupo disponible en Addi y quiero usarlo hoy. Mi cupo es de: ",
    image: "",
    points: ["Aliado oficial Addi", "Descuento exclusivo con Addi", "Respuesta inmediata por WhatsApp", "Pagas en la app oficial"]
  },
  partners: [
    { name: "Addi", logo: "", note: "Compra ahora, paga después" },
    { name: "Sistecrédito", logo: "", note: "Crédito al instante" }
  ],
  simulator: {
    title: "¿Cuánto cupo tienes? Mira cuánto rinde aquí",
    subtitle: "Mueve el valor y el plazo. Verás tu ahorro pagando con Addi y una cuota de referencia para planear tu presupuesto.",
    min: 50000,
    max: 5000000,
    step: 10000,
    initial: 600000,
    plazos: [1, 3, 6, 9, 12],
    monthlyRate: 1.8,
    addiDiscount: 5,
    note: "Valores de referencia. La aprobación, el cupo, la tasa y el plazo final los define Addi o Sistecrédito en su plataforma, según tu perfil.",
    cta: "Me interesa",
    message: "Hola 👋 Hice la simulación en su página: compra de {monto} a {plazo} cuotas (cuota aprox. {cuota}, ahorro {ahorro}). Quiero usar mi cupo.",
    image: ""
  },
  steps: [
    { title: "Elige tus productos", text: "Agrega al carrito todo lo que quieras. Un solo pedido, una sola solicitud de crédito." },
    { title: "Escríbenos por WhatsApp", text: "Tu pedido llega armado a nuestro WhatsApp. Confirmamos disponibilidad y te enviamos el enlace de pago." },
    { title: "Paga con Addi o Sistecrédito", text: "Completas el pago en la plataforma oficial con tu cédula y celular. Ellos aprueban en minutos." },
    { title: "Recibe en tu casa", text: "Despachamos con guía de seguimiento. Pagas tus cuotas directamente a la plataforma." }
  ],
  benefits: [
    { icon: "shield", title: "Pago en plataforma oficial", text: "Nunca te pedimos claves ni códigos. Todo el pago ocurre dentro de Addi o Sistecrédito." },
    { icon: "bolt", title: "Respuesta rápida", text: "Un asesor real te atiende por WhatsApp y te guía con la solicitud." },
    { icon: "cart", title: "Varios productos, una cuota", text: "Combina productos en el mismo pedido y organiza mejor tu presupuesto." },
    { icon: "receipt", title: "Factura y garantía", text: "Cada compra sale con factura electrónica y garantía del fabricante." }
  ],
  benefitsImage: "",
  productsSection: {
    title: "Productos disponibles a cuotas",
    subtitle: "Precios de contado. Al pagar con Addi o Sistecrédito eliges el plazo dentro de la plataforma.",
    image: ""
  },
  products: [
    { id: "p1", name: "Celular 128 GB · Gama media", category: "Tecnología", price: 899000, oldPrice: 1049000, badge: "Más pedido", image: "" },
    { id: "p2", name: "Televisor Smart 50\" 4K", category: "Hogar", price: 1599000, oldPrice: 0, badge: "", image: "" },
    { id: "p3", name: "Audífonos inalámbricos", category: "Tecnología", price: 189000, oldPrice: 239000, badge: "Oferta", image: "" },
    { id: "p4", name: "Portátil 14\" · 8 GB RAM", category: "Tecnología", price: 1899000, oldPrice: 0, badge: "", image: "" },
    { id: "p5", name: "Freidora de aire 5 L", category: "Hogar", price: 329000, oldPrice: 389000, badge: "", image: "" },
    { id: "p6", name: "Reloj inteligente", category: "Accesorios", price: 249000, oldPrice: 0, badge: "Nuevo", image: "" }
  ],
  servicesTitle: "Mejora tu compra (opcional)",
  services: [
    { id: "s1", name: "Envío express 24 h", desc: "Ciudades principales. Llega al día siguiente hábil.", price: 15000 },
    { id: "s2", name: "Entrega lista para usar", desc: "Configuramos tu celular o portátil y pasamos tus datos.", price: 35000 },
    { id: "s3", name: "Garantía extendida 6 meses", desc: "Seis meses más de cobertura después de la del fabricante.", price: 59000 }
  ],
  testimonials: [],
  faq: [
    { q: "¿Necesito tener cupo aprobado antes de pedir?", a: "No es obligatorio. Si no tienes cupo, la plataforma lo evalúa al momento del pago con tu cédula y celular. Si ya lo tienes, el proceso es todavía más rápido." },
    { q: "¿Puedo comprar varios productos en una sola compra?", a: "Sí. Agrega todo al carrito y envíanos el pedido. Generamos un único enlace de pago por el total." },
    { q: "¿Ustedes aprueban el crédito?", a: "No. Somos un comercio aliado. La aprobación, el cupo, la tasa y las cuotas los define Addi o Sistecrédito según sus políticas." },
    { q: "¿Me van a pedir contraseñas o códigos?", a: "Nunca. No pidas ni compartas códigos de verificación por chat. El pago se completa únicamente en la app o web oficial de la plataforma." },
    { q: "¿Hacen envíos a toda Colombia?", a: "Sí, despachamos a nivel nacional con transportadora y número de guía. El tiempo depende de tu ciudad." }
  ],
  legal: {
    company: "CupoPlus S.A.S.",
    nit: "NIT 900.000.000-0",
    address: "Bogotá, Colombia",
    email: "contacto@tudominio.com",
    disclaimer: "Somos un comercio aliado. Addi y Sistecrédito son marcas de sus respectivos titulares y son quienes otorgan y administran el crédito. Las cuotas mostradas en el simulador son una referencia y no constituyen una oferta de crédito. Tratamos tus datos conforme a la Ley 1581 de 2012."
  },
  footerLinks: [
    { label: "Política de tratamiento de datos", url: "#" },
    { label: "Términos y condiciones", url: "#" },
    { label: "Derecho de retracto", url: "#" },
    { label: "Superintendencia de Industria y Comercio", url: "https://www.sic.gov.co" }
  ]
};
