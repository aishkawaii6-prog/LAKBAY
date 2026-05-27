// ═══════════════════════════════════════════════════════════
//  src/data/spots.js
//  All default tourist spot data and seed feedback
// ═══════════════════════════════════════════════════════════

// Images moved to public/assets/images for proper loading
const bangonImg    = '/assets/images/bangon-falls.webp'
const tarangbanImg = '/assets/images/tarangban-falls.jpg'
const malajogImg   = '/assets/images/malajog-beach.jpg'
const nijagaImg    = '/assets/images/nijaga-park.webp'
const cathedralImg = '/assets/images/cathedral.jpg'
const caveImg      = '/assets/images/longsob-cave.jpg'

export const DEFAULT_SPOTS = [
  {
    id: 's1',
    name: 'Bangon Falls',
    category: 'Waterfall',
    location: 'Bangon Falls, Barangay Bangon, Calbayog City, Samar',
    coverImage: bangonImg,
    images: [
      bangonImg,
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    ],
    description:
      "Bangon Falls cascades dramatically over wide rocky formations into a deep emerald-green natural pool. Visitors trek through lush tropical rainforest to reach it — and the journey is a rewarding adventure in itself. The pool is wide and calm enough for swimming, making it a perfect cool-down after the forest hike.",
    history:
      "A city ordinance protects the surrounding forest as a Tourism cum Power Sources zone — the falls feed a mini-hydroelectric plant powering nearby barangays. Tree-cutting and slash-and-burn farming are strictly prohibited within the falls' perimeter to preserve both the natural beauty and the water supply for the community.",
    discovery:
      "Bangon Falls was introduced to wider Philippine audiences through outdoor adventure websites around 2007. The unique experience of walking along the stream to ascend the cascade attracted trekkers from across the Visayas, and word-of-mouth recommendations helped establish it as one of Calbayog's signature destinations.",
    createdAt: '2024-01-10',
    featured: true,
    mapUrl: '',
    latitude: 12.0674,
    longitude: 124.5964,
    // Generate Google Maps embed URL
    getMapUrl: () => `https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=12.0674,124.5964&zoom=15&maptype=satellite`
  },
  {
    id: 's2',
    name: 'Tarangban Falls',
    category: 'Waterfall',
    location: 'Tarangban Falls, Barangay Tarangban, Calbayog City, Samar',
    coverImage: tarangbanImg,
    images: [
      tarangbanImg,
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80',
    ],
    description:
      "Tarangban Falls is the crown jewel of Calbayog's waterfalls and consistently ranked #1 on TripAdvisor for things to do in the city. Unlike typical waterfalls that plunge straight down, Tarangban's water flows over dramatically slanting rock formations, creating a wide, multi-tiered silky curtain through towering rainforest.",
    history:
      "The name 'Tarangban' comes from the Waray word for a meeting place, referencing the confluence of mountain streams that feed the falls. The Waray people of Barangay Tarangban have revered this site for generations, and it remained largely inaccessible to outsiders for centuries, known only to local farmers and forest dwellers.",
    discovery:
      'Tarangban was brought to national attention by travel writers and bloggers in the early 2000s, who described it as one of the top three most beautiful waterfalls in the entire Philippines. TripAdvisor reviews and social media posts in the 2010s dramatically raised its profile, making it a must-visit for any traveler to Eastern Visayas.',
    createdAt: '2024-01-12',
    featured: true,
    latitude: 12.0697,
    longitude: 124.5921,
    getMapUrl: () => `https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=12.0697,124.5921&zoom=15&maptype=satellite`
  },
{
    id: 's3',
    name: 'Malajog Beach',
    category: 'Beach',
    location: 'Malajog Beach Pier, Barangay Malajog, Calbayog City, Samar',
    coverImage: malajogImg,
    images: [
      malajogImg,
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    ],
    description:
      "Malajog Beach — locally known as Looc Beach — is Calbayog City's premier beach destination. Crystal-clear calm waters meet dramatic rocky formations and lush forested hills. The main attraction is a famous 912-meter zipline that launches from the mainland and soars above the sea to Daraga Island.",
    history:
      'Malajog has been a fishing community for centuries. The Malajog Leisure Park Resort was established in the early 2000s, developing the beachfront with the iconic sea zipline. The Calbayog City Water District also constructed a major dam near Malajog to supply water to inland barangays.',
    discovery:
      "Malajog Beach was promoted by the city government in the late 1990s. The installation of the 912-meter sea zipline dramatically raised the beach's profile and attracted thrill-seekers from across the Philippines, helping position Calbayog as a premier adventure tourism hub in the Visayas.",
    createdAt: '2024-01-15',
    featured: true,
    latitude: 12.0456,
    longitude: 124.6123,
    getMapUrl: () => `https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=12.0456,124.6123&zoom=15&maptype=satellite`
  },
{
    id: 's4',
    name: 'Sts. Peter & Paul Cathedral',
    category: 'Heritage',
    location: 'Sts. Peter & Paul Cathedral, JD Avelino St., Brgy. West Awang, Calbayog City, Samar',
    coverImage: cathedralImg,
    images: [
      cathedralImg,
      'https://images.unsplash.com/photo-1548032885-b5e38734688a?w=800&q=80',
      'https://images.unsplash.com/photo-1545293527-e26058c5b48b?w=800&q=80',
    ],
    description:
      "The Saints Peter and Paul Cathedral is the seat of the Diocese of Calbayog and the largest church in all of Samar. Its architecture blends many eras — original Spanish-built stone walls, dome, and bell tower that have endured centuries of earthquakes, typhoons, and wars.",
    history:
      "First constructed in the 1800s under Spanish colonial rule, its foundational Spanish-era stone walls have endured. The Diocese of Calbayog was formally created by Pope Pius X on April 10, 1910, cementing the cathedral's central role in the spiritual life of all of Samar.",
    discovery:
      "The site was first consecrated by Spanish missionaries in the 16th century as part of the Reducción policy. Historical records document the cathedral as one of the oldest religious sites in Eastern Visayas.",
    createdAt: '2024-02-01',
    featured: false,
    latitude: 12.0671,
    longitude: 124.5957,
    getMapUrl: () => `https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=12.0671,124.5957&zoom=15&maptype=satellite`
  },
  {
    id: 's5',
    name: 'Nijaga Park',
    category: 'Park',
    location: 'Nijaga Park, Brgy Obrero, Gomez Street, Calbayog City, Samar',
    coverImage: nijagaImg,
    images: [
      nijagaImg,
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    ],
    description:
      "Nijaga Park is Calbayog City's largest public green space, beside the Calbayog River. It features walking paths, manicured gardens, and an artificial replica of Bangon Falls — letting city residents enjoy the beauty without the mountain trek.",
    history:
      "Named after local hero Benedicto Nijaga, the park was developed by the city government. The artificial waterfall replica was added to celebrate the city's identity as the 'City of Waterfalls.'",
    discovery:
      "Nijaga Park was designed to bring nature to the urban core of Calbayog, accessible to all residents. It serves as a year-round gathering place, especially popular at night when beautifully lit up.",
    createdAt: '2024-02-10',
    featured: false,
    latitude: 12.0633,
    longitude: 124.6034,
    getMapUrl: () => `https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=12.0633,124.6034&zoom=15&maptype=satellite`
  },
  {
    id: 's6',
    name: 'Longsob Cave',
    category: 'Adventure',
    location: 'Longsob Cave, Barangay Longsob, Calbayog City, Samar',
    coverImage: caveImg,
    images: [
      caveImg,
      'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=800&q=80',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
    ],
    description:
      "Deep within the limestone karst hills of Barangay Longsob lie the Guinogo-an Caves — an underground world of emerald-green pools, moss-covered rock formations, and hidden chambers lit by natural light. The cave system is accessible by boat through a narrow water passage, making it one of the most unique spelunking experiences in Eastern Visayas.",
    history:
      "The caves of Longsob have been known to Waray communities for centuries and were used as natural shelters during typhoons and conflicts. They were documented as part of a broader archaeological heritage survey of Samar Island.",
    discovery:
      "The Longsob caves were formally surveyed in the 1970s–1980s, when researchers recovered burial jars, log coffins, and pre-colonial pottery from cave systems across Samar. This led to their development as an eco-adventure destination.",
    createdAt: '2024-03-01',
    featured: false,
    latitude: 12.0821,
    longitude: 124.6178,
    getMapUrl: () => `https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=12.0821,124.6178&zoom=15&maptype=satellite`
  },
]

export const DEFAULT_FEEDBACK = [
  {
    id: 'f1', spotId: '1', spotName: 'Bangon Falls',
    name: 'Maria Santos', rating: 5,
    comment: 'Absolutely stunning! The trek through the forest makes reaching the falls even more rewarding. The emerald pool is crystal clear and perfect for swimming.',
    date: '2024-03-15',
  },
  {
    id: 'f2', spotId: '2', spotName: 'Tarangban Falls',
    name: 'Jose Reyes', rating: 5,
    comment: 'The most beautiful waterfall I have ever seen. The way the water spreads sideways over the rocks is unlike anything else in the Philippines. Truly world-class.',
    date: '2024-03-20',
  },
  {
    id: 'f3', spotId: '3', spotName: 'Malajog Beach',
    name: 'Ana Dela Cruz', rating: 4,
    comment: 'The zipline over the sea is absolutely thrilling! The beach is calm and the water is crystal clear. A perfect spot for both adventure and relaxation.',
    date: '2024-04-01',
  },
  {
    id: 'f4', spotId: '4', spotName: 'Sts. Peter \u0026 Paul Cathedral',
    name: 'Roberto Cruz', rating: 5,
    comment: 'A magnificent piece of living history. The Spanish-era stone walls and the glowing dome at dusk are absolutely breathtaking. A must-visit for heritage lovers.',
    date: '2024-04-10',
  },
  {
    id: 'f5', spotId: '5', spotName: 'Nijaga Park',
    name: 'Liza Fernandez', rating: 4,
    comment: 'A lovely spot to relax in the heart of the city. The artificial falls are beautiful at night when lit up, and the whole park has a peaceful atmosphere.',
    date: '2024-04-15',
  },
  {
    id: 'f6', spotId: '6', spotName: 'Longsob Cave',
    name: 'Marco Santos', rating: 5,
    comment: 'Entering the cave by boat through that narrow water passage is unlike anything I have experienced. The emerald green pool inside is absolutely magical.',
    date: '2024-04-20',
  },
]

export const DEFAULT_ADMINS = [
  {
    id: 'a1', name: 'Administrator', username: 'admin',
    email: 'admin@lakbaycalbayog.ph', password: 'admin123',
    role: 'Super Admin', createdAt: '2024-01-01',
  },
]

export const SLIDE_CONFIG = [
  { image: bangonImg,    position: 'center 30%', label: 'Bangon Falls'              },
  { image: tarangbanImg, position: 'center 18%', label: 'Tarangban Falls'           },
  { image: malajogImg,   position: 'center 55%', label: 'Malajog Beach'             },
  { image: nijagaImg,    position: 'center 20%', label: 'Nijaga Park'               },
  { image: cathedralImg, position: 'center 40%', label: 'Sts. Peter & Paul Cathedral' },
  { image: caveImg,      position: 'center 50%', label: 'Longsob Cave'              },
]
