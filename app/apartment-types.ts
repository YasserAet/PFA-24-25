export const APARTMENT_TYPES = [
  {
    id: "Lavender",
    name: "Lavender Apartment",
    description: "Brings serenity into every corner.",
    thumbnail: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/La(5).jpg",
    color: "#9333ea",
  },
  {
    id: "Terracotta",
    name: "Terracotta Apartment",
    description: "Energizes and refreshes your senses.",
    thumbnail: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/T(1).jpg",
    color: "#ea580c",
  },
  {
    id: "Limelight",
    name: "Limelight Apartment",
    description: "Boldness pulses through your space.",
    thumbnail: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/L(1).jpg",
    color: "#65a30d",
  },
  {
    id: "BuildingExterior",
    name: "Building Exterior",
    description: "360° view of the complete Building",
    thumbnail: "https://pub-7f8441f955d040ad9b27496b0af87b7a.r2.dev/Gallery/B(1).png",
    color: "#1e40af", 
  },
];


export const APARTMENT_PANORAMAS = {
   BuildingExterior: [
    {
      id: "exterior-main",
      title: "Building Exterior View",
      url: "/images/panoramas/BP.jpg",
      hotspots: [
      ]
    }
  ],
  Terracotta: [
    {
      id: "kitchen_living_room",
      title: "KITCHEN & LIVING ROOM",
      url: "/images/panoramas/TP(1).jpg",
      hotspots: [
        { roomId: "lobby", label: "Lobby", position: "-4.9 -0.1 -1.1", rotation: "0 0 0" },
        { roomId: "laundry_room", label: "Laundry", position: "-4 -0.2 -2.9", rotation: "0 0 0" },
        { roomId: "toilette", label: "Toilette", position: "-2.7 0 -4.2", rotation: "0 0 0" },
      ],
    },
    {
      id: "master_room",
      title: "MASTER ROOM",
      url: "/images/panoramas/TP(2).jpg",
      hotspots: [
        { roomId: "bathroom", label: "Bathroom", position: "2.2 -3 -3.4", rotation: "0 0 0" },
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "2.8 0.1 -4.2", rotation: "0 0 0" },
      ],
    },
    {
      id: "lobby",
      title: "LOBBY",
      url: "/images/panoramas/TP(6).jpg",
      hotspots: [
        { roomId: "master_room", label: "Master Room", position: "5 0.9 0", rotation: "0 0 0" },
      ],
    },
    {
      id: "bathroom",
      title: "BATHROOM",
      url: "/images/panoramas/TP(3).jpg",
      hotspots: [
        { roomId: "lobby", label: "Lobby", position: "4.9 0.4 0.7", rotation: "0 0 0" },
      ],
    },
    {
      id: "laundry_room",
      title: "LAUNDRY ROOM",
      url: "/images/panoramas/TP(5).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen", position: "2.5 -0.1 4.3", rotation: "0 0 0" },
      ],
    },
    {
      id: "toilette",
      title: "TOILETTE",
      url: "/images/panoramas/TP(4).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "-1.7 0.2 2.5", rotation: "0 0 0" },
      ],
    },
  ],
  Lavender: [
    {
      id: "entrance",
      title: "ENTRANCE",
      url: "/images/panoramas/LaP(2).jpg",
      hotspots: [
        { roomId: "toilette", label: "TOILETTE", position: "-4.9 0.7 -0.4", rotation: "0 0 0" },
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "-4.3 0.3 2.5", rotation: "0 0 0" },
        { roomId: "bedroom", label: "Bedroom", position: "4.9 0.7 -0.3", rotation: "0 0 0" },
        { roomId: "laundry", label: "Laundry", position: "2.3 0.3 4.4", rotation: "0 0 0" },
      ],
    },
    {
      id: "living_room",
      title: "LIVING ROOM",
      url: "/images/panoramas/LaP(7).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "5 0.6 0.1", rotation: "0 0 0" },
        { roomId: "entrance", label: "Entrance", position: "2 0.1 -4.6", rotation: "0 0 0" },
      ],
    },
    {
      id: "kitchen_living_room",
      title: "KITCHEN & LIVING ROOM",
      url: "/images/panoramas/LaP(3).jpg",
      hotspots: [
        { roomId: "living_room", label: "Living Room", position: "-5 0.3 0.5", rotation: "0 0 0" },
        { roomId: "laundry", label: "Laundry", position: "0 0 -5", rotation: "0 0 0" },
      ],
    },
    {
      id: "bedroom",
      title: "BEDROOM",
      url: "/images/panoramas/LaP(1).jpg",
      hotspots: [
        { roomId: "bathroom", label: "Bathroom", position: "-1.8 -1.5 -4.4", rotation: "0 0 0" },
        { roomId: "entrance", label: "Entrance", position: "-1.9 0.5 -5", rotation: "0 0 0" },
      ],
    },
    {
      id: "bathroom",
      title: "BATHROOM",
      url: "/images/panoramas/LaP(4).jpg",
      hotspots: [
        { roomId: "bedroom", label: "Bedroom", position: "3.5 0.6 -0.6", rotation: "0 0 0" },
      ],
    },
    {
      id: "laundry",
      title: "LAUNDRY",
      url: "/images/panoramas/LaP(6).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "-0.1 -0.2 5", rotation: "0 0 0" },
        { roomId: "entrance", label: "Entrance", position: "-2.6 0.7 -4.2", rotation: "0 0 0" },
      ],
    },
    {
      id: "toilette",
      title: "TOILETTE",
      url: "/images/panoramas/LaP(5).jpg",
      hotspots: [
        { roomId : "entrance", label: "Entrance", position: "-2.9 1 0.7", rotation: "0 0 0" },
      ],
    },
  ],
  Limelight: [
    {
      id: "living_room",
      title: "LIVING ROOM",
      url: "/images/panoramas/LP(1).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "5 0.2 0.6", rotation: "0 0 0" },
      ],
    },
    {
      id: "kitchen_living_room",
      title: "KITCHEN & LIVING ROOM",
      url: "/images/panoramas/LP(6).jpg",
      hotspots: [
        { roomId: "bedroom", label: "BEDROOM", position: "4.1 1.1 -2.7", rotation: "0 0 0" },
        { roomId: "living_room", label: "Living Room", position: "-4.7 0.5 1.5", rotation: "0 0 0" },
        { roomId: "bathroom_1", label: "Bathroom 1", position: "0.8 1.1 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "bedroom",
      title: "BEDROOM",
      url: "/images/panoramas/LP(5).jpg",
      hotspots: [
        { roomId: "dressing_room", label: "Dressing Room", position: "0.3 0.5 -3", rotation: "0 0 0" },
        { roomId: "living_room", label: "Living Room", position: "-2.9 0.7 -4", rotation: "0 0 0" },
      ],
    },
    {
      id: "bathroom_1",
      title: "BATHROOM 1",
      url: "/images/panoramas/LP(3).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "-0.5 0.1 1.8", rotation: "0 0 0" },
      ],
    },
    {
      id: "bathroom_2",
      title: "BATHROOM 2",
      url: "/images/panoramas/LP(2).jpg",
      hotspots: [
        { roomId: "dressing_room", label: "Dressing Room", position: "-1 0.2 1.8", rotation: "0 0 0" }, 
      ],
    },
    {
      id: "dressing_room",
      title: "DRESSING ROOM",
      url: "/images/panoramas/LP(4).jpg",
      hotspots: [
        { roomId: "bathroom_2", label: "BATHROOM 2", position: "0 0.2 -2.5", rotation: "0 0 0" },
        { roomId: "bedroom", label: "BEDROOM", position: "-4.6 0.8 1.8", rotation: "0 0 0" },
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "-4.9 0.9 0", rotation: "0 0 0" },
      ],
    },
  ],
};