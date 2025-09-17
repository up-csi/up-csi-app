export interface mem {
    member_id: number;
    name: string;
    role: string;
    category: string;
    photo: string;
}

export const members: mem[] = [
    {
        member_id: 5,
        name: 'Benj Lazaro',
        role: 'President',
        category: 'Exec',
        photo: 'BenjLazaro',
    },
    {
        member_id: 16,
        name: 'Nate Zuñiga',
        role: 'Director for Membership and Internals',
        category: 'Exec',
        photo: 'NateZuñiga',
    },
    {
        member_id: 4,
        name: 'Bryan Uy',
        role: 'Vice President for Service',
        category: 'Exec',
        photo: 'BryanUy',
    },
    {
        member_id: 36,
        name: 'Sidney Fernando',
        role: 'Co-Vice President for Innovation',
        category: 'Exec',
        photo: 'SidneyFernando',
    },
    {
        member_id: 48,
        name: 'Mikel Arcardo',
        role: 'Co-Vice President for Innovation',
        category: 'Exec',
        photo: 'MikelArcardo',
    },
    {
        member_id: 40,
        name: 'Ehren Castillo',
        role: 'Director for Engineering',
        category: 'Exec',
        photo: 'EhrenCastillo',
    },
    {
        member_id: 52,
        name: 'Cessa Gonzales',
        role: 'Director for External Relations',
        category: 'Exec',
        photo: 'CessaGonzales',
    },
    {
        member_id: 66,
        name: 'Karin Consebido',
        role: 'Vice President for Branding and Creatives',
        category: 'Exec',
        photo: 'KarinConsebido',
    },

    { member_id: 7, name: 'Isay Bucu', role: '', category: 'B&C', photo: 'IsayBucu' },
    { member_id: 61, name: 'Eko Delflin', role: '', category: 'B&C', photo: 'EkoDelflin' },
    { member_id: 62, name: 'Fibi Moraca', role: '', category: 'B&C', photo: 'FibiMoraca' },
    { member_id: 67, name: 'Karlo Domingo', role: '', category: 'B&C', photo: 'KarloDomingo' },
    { member_id: 68, name: 'Paula Domingo', role: '', category: 'B&C', photo: 'PaulaDomingo' },
    { member_id: 71, name: 'Yuwen Saavedra', role: '', category: 'B&C', photo: 'YuwenSaavedra' },
    { member_id: 72, name: 'Char Sim', role: '', category: 'B&C', photo: 'CharSim' },

    { member_id: 11, name: 'Cedric Legara', role: '', category: 'Engg', photo: 'CedricLegara' },
    { member_id: 21, name: 'Elijah Mejilla', role: '', category: 'Engg', photo: 'ElijahMejilla' },
    { member_id: 43, name: 'Lily Celestino', role: '', category: 'Engg', photo: 'LilyCelestino' },
    { member_id: 44, name: 'Louie Torres', role: '', category: 'Engg', photo: 'LouieTorres' },
    { member_id: 45, name: 'Lucas Agcaoili', role: '', category: 'Engg', photo: 'LucasAgcaoili' },
    { member_id: 46, name: 'Marcus Pascual', role: '', category: 'Engg', photo: 'MarcusPascual' },
    { member_id: 47, name: 'Michael Real', role: '', category: 'Engg', photo: 'MichaelReal' },
    { member_id: 50, name: 'Yenyen Galinato', role: '', category: 'Engg', photo: 'YenyenGalinato' },
    { member_id: 59, name: 'Jacky Abucay', role: '', category: 'Engg', photo: 'JackyAbucay' },
    { member_id: 73, name: 'Marius Barcenas', role: '', category: 'Engg', photo: 'MariusBarcenas' },

    { member_id: 51, name: 'Alyssa Añonuevo', role: '', category: 'Exte', photo: 'AlyssaAñonuevo' },
    { member_id: 6, name: 'Sean Tolentino', role: '', category: 'Exte', photo: 'SeanKenjiTolentino' },
    { member_id: 53, name: 'Dash Ceñido', role: '', category: 'Exte', photo: 'DashCeñido' },
    { member_id: 57, name: 'GV Vitug', role: '', category: 'Exte', photo: 'GVVitug' },
    { member_id: 58, name: 'Inigo De Guzman', role: '', category: 'Exte', photo: 'InigoDeGuzman' },
    { member_id: 60, name: 'Rafa Jimenez', role: '', category: 'Exte', photo: 'RafaJimenez' },
    { member_id: 23, name: 'Jerome Estrella', role: '', category: 'Exte', photo: 'JeromeEstrella' },
    { member_id: 74, name: 'Julian Dolojan', role: '', category: 'Exte', photo: 'LinoPlaceholder' },

    { member_id: 29, name: 'Alec Lopez', role: '', category: 'Innov', photo: 'AlecLopez' },
    { member_id: 30, name: 'CJ Salces', role: '', category: 'Innov', photo: 'CJSalces' },
    { member_id: 32, name: 'Hanz Vicencio', role: '', category: 'Innov', photo: 'HanzVicencio' },
    { member_id: 33, name: 'KC Abriol', role: '', category: 'Innov', photo: 'KCAbriol' },
    { member_id: 34, name: 'Kurt Lanting', role: '', category: 'Innov', photo: 'KurtLanting' },
    { member_id: 35, name: 'Migz Guiang', role: '', category: 'Innov', photo: 'MigzGuiang' },
    { member_id: 38, name: 'Ysaac Villamil', role: '', category: 'Innov', photo: 'YsaacVillamil' },
    { member_id: 20, name: 'Dale Flores', role: '', category: 'Innov', photo: 'DaleFlores' },
    { member_id: 75, name: 'Ellie Lim', role: '', category: 'Innov', photo: 'EllieLim' },

    { member_id: 8, name: 'Abe Sahi', role: '', category: 'M&I', photo: 'AbeSahi' },
    { member_id: 9, name: 'Aisha Go', role: '', category: 'M&I', photo: 'AishaGo' },
    { member_id: 2, name: 'BMae Amurao', role: '', category: 'M&I', photo: 'BmaeAmurao' },
    { member_id: 17, name: 'Paolo Lapira', role: '', category: 'M&I', photo: 'PaoloLapira' },
    { member_id: 18, name: 'Trish Obzunar', role: '', category: 'M&I', photo: 'TrishObzunar' },
    { member_id: 42, name: 'Kenneth Co', role: '', category: 'M&I', photo: 'KennethCo' },
    { member_id: 63, name: 'Gabby Sacramento', role: '', category: 'M&I', photo: 'GabbySacramento' },
    { member_id: 76, name: 'Azul Eusebio', role: '', category: 'M&I', photo: 'AzulEusebio' },

    { member_id: 3, name: 'Don Chavez', role: '', category: 'Service', photo: 'DonSebastienChavez' },
    { member_id: 22, name: 'Ethan Filio', role: '', category: 'Service', photo: 'EthanFilio' },
    { member_id: 25, name: 'Leanne Austria', role: '', category: 'Service', photo: 'LeanneAustria' },
    { member_id: 27, name: 'Shereena Villafania', role: '', category: 'Service', photo: 'ShereenaVillafania' },
    { member_id: 28, name: 'Shey Manzala', role: '', category: 'Service', photo: 'SheyManzala' },
    { member_id: 41, name: 'Emman Amante', role: '', category: 'Service', photo: 'EmmanAmante' },
    { member_id: 69, name: 'Sam Siy', role: '', category: 'Service', photo: 'SamSiy' },
    { member_id: 77, name: 'Andri Crisostomo', role: '', category: 'Service', photo: 'AndriCrisostomo' },
];

export default members;
