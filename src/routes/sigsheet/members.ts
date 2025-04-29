export interface mem {
    name: string;
    role: string;
    category: string;
    photo: string;
}

export const members: mem[] = [
    { name: 'Victor Reyes', role: 'President & Director for Engineering', category: 'Exec', photo: "VictorReyes" },
    { name: 'BMae Amurao', role: 'Director for Membership and Internals', category: 'Exec', photo: "BmaeAmurao" },
    { name: 'Don Chavez', role: 'Co-Vice President for Service', category: 'Exec', photo: "DonSebastienChavez" },
    { name: 'Bryan Uy', role: 'Co-Vice President for Service', category: 'Exec', photo: "BryanUy" },
    { name: 'Benj Lazaro', role: 'Vice President for Innovation', category: 'Exec', photo: "BenjLazaro" },
    { name: 'Sean Tolentino', role: 'Director for External Relations', category: 'Exec', photo: "SeanKenjiTolentino" },
    { name: 'Isay Bucu', role: 'Vice President for Branding and Creatives', category: 'Exec', photo: "IsayBucu" },

    { name: "Eko Delflin", role: "", category: "B&C", photo: "EkoDelflin" },
    { name: "Fibi Moraca", role: "", category: "B&C", photo: "FibiMoraca" },
    { name: "Gabby Sacramento", role: "", category: "B&C", photo: "GabbySacramento" },
    { name: "Jason Katipunan", role: "", category: "B&C", photo: "JasonKatipunan" },
    { name: "Jovs Juanes", role: "", category: "B&C", photo: "JovsJuanes" },
    { name: "Karin Consebido", role: "", category: "B&C", photo: "KarinConsebido" },
    { name: "Karlo Domingo", role: "", category: "B&C", photo: "KarloDomingo" },
    { name: "Paula Domingo", role: "", category: "B&C", photo: "PaulaDomingo" },
    { name: "Sam Siy", role: "", category: "B&C", photo: "SamSiy" },
    { name: "Wyn Almazan", role: "", category: "B&C", photo: "WynAlmazan" },
    { name: "Yuwen Saavedra", role: "", category: "B&C", photo: "YuwenSaavedra" },

    { name: "Daryll Ko", role: "", category: "Engg", photo: "DaryllKo" },
    { name: "Ehren Castillo", role: "", category: "Engg", photo: "EhrenCastillo" },
    { name: "Emman Amante", role: "", category: "Engg", photo: "EmmanAmante" },
    { name: "Kenneth Co", role: "", category: "Engg", photo: "KennethCo" },
    { name: "Lily Celestino", role: "", category: "Engg", photo: "LilyCelestino" },
    { name: "Louie Torres", role: "", category: "Engg", photo: "LouieTorres" },
    { name: "Lucas Agcaoili", role: "", category: "Engg", photo: "LucasAgcaoili" },
    { name: "Marcus Pascual", role: "", category: "Engg", photo: "MarcusPascual" },
    { name: "Michael Real", role: "", category: "Engg", photo: "MichaelReal" },
    { name: "Mikel Arcardo", role: "", category: "Engg", photo: "MikelArcardo" },
    { name: "Vaughn Aquino", role: "", category: "Engg", photo: "VaughnAquino" },
    { name: "Yenyen Galinato", role: "", category: "Engg", photo: "YenyenGalinato" },

    { name: "Alyssa Añonuevo", role: "", category: "Exte", photo: "AlyssaAñonuevo" },
    { name: "Cessa Gonzales", role: "", category: "Exte", photo: "CessaGonzales" },
    { name: "Dash Ceñido", role: "", category: "Exte", photo: "DashCeñido" },
    { name: "Denise Dee", role: "", category: "Exte", photo: "DeniseDee" },
    { name: "Diego Montenejo", role: "", category: "Exte", photo: "DiegoMontenejo" },
    { name: "Gab Ramos", role: "", category: "Exte", photo: "GabRamos" },
    { name: "GV Vitug", role: "", category: "Exte", photo: "GVVitug" },
    { name: "Inigo De Guzman", role: "", category: "Exte", photo: "InigoDeGuzman" },
    { name: "Jacky Abucay", role: "", category: "Exte", photo: "JackyAbucay" },
    { name: "Rafa Jimenez", role: "", category: "Exte", photo: "RafaJimenez" },

    { name: "Alec Lopez", role: "", category: "Innov", photo: "AlecLopez" },
    { name: "CJ Salces", role: "", category: "Innov", photo: "CJSalces" },
    { name: "Ethan Camingao", role: "", category: "Innov", photo: "EthanCamingao" },
    { name: "Hanz Vicencio", role: "", category: "Innov", photo: "HanzVicencio" },
    { name: "KC Abriol", role: "", category: "Innov", photo: "KCAbriol" },
    { name: "Kurt Lanting", role: "", category: "Innov", photo: "KurtLanting" },
    { name: "Migz Guiang", role: "", category: "Innov", photo: "MigzGuiang" },
    { name: "Sidney Fernando", role: "", category: "Innov", photo: "SidneyFernando" },
    { name: "Simon Garcia", role: "", category: "Innov", photo: "SimonGarcia" },
    { name: "Ysaac Villamil", role: "", category: "Innov", photo: "YsaacVillamil" },

    { name: "Abe Sahi", role: "", category: "M&I", photo: "AbeSahi" },
    { name: "Aisha Go", role: "", category: "M&I", photo: "AishaGo" },
    { name: "Arian Balicusto", role: "", category: "M&I", photo: "ArianBalicusto" },
    { name: "Cedric Legara", role: "", category: "M&I", photo: "CedricLegara" },
    { name: "Cole Lago", role: "", category: "M&I", photo: "ColeLago" },
    { name: "Elle Gaza", role: "", category: "M&I", photo: "ElleGaza" },
    { name: "Fahad Decampong", role: "", category: "M&I", photo: "FahadDecampong" },
    { name: "Lance Raphael Bassig", role: "", category: "M&I", photo: "LanceRaphaelBassig" },
    { name: "Nate Zuñiga", role: "", category: "M&I", photo: "NateZuñiga" },
    { name: "Paolo Lapira", role: "", category: "M&I", photo: "PaoloLapira" },
    { name: "Trish Obzunar", role: "", category: "M&I", photo: "TrishObzunar" },

    { name: "Cellin Cheng", role: "", category: "Service", photo: "CellinCheng" },
    { name: "Dale Flores", role: "", category: "Service", photo: "DaleFlores" },
    { name: "Elijah Mejilla", role: "", category: "Service", photo: "ElijahMejilla" },
    { name: "Ethan Filio", role: "", category: "Service", photo: "EthanFilio" },
    { name: "Jerome Estrella", role: "", category: "Service", photo: "JeromeEstrella" },
    { name: "Jus Ruaya", role: "", category: "Service", photo: "JusRuaya" },
    { name: "Leanne Austria", role: "", category: "Service", photo: "LeanneAustria" },
    { name: "Rain Lee", role: "", category: "Service", photo: "RainLee" },
    { name: "Shereena Villafania", role: "", category: "Service", photo: "ShereenaVillafania" },
    { name: "Shey Manzala", role: "", category: "Service", photo: "SheyManzala" }

];

export default members;
