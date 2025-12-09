// Mock Data Store
const db = {
    user: null, // Current logged in user
    songs: [
        {
            id: '1',
            title: 'Neon Nights',
            artist: 'CyberPunk',
            price: 15.00,
            currency: 'USD',
            cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
            plays: 1240,
            genre: 'Synthwave'
        },
        {
            id: '2',
            title: 'Ethereal Dreams',
            artist: 'Luna',
            price: 10.00,
            currency: 'USD',
            cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop',
            plays: 850,
            genre: 'Ambient'
        },
        {
            id: '3',
            title: 'Bass Drop Protocol',
            artist: 'DJ Node',
            price: 20.00,
            currency: 'USD',
            cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
            plays: 3200,
            genre: 'Dubstep'
        }
    ],
    posts: [
        {
            id: 'p1',
            author: 'CyberPunk',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cyber',
            content: 'Just dropped a new track "Neon Nights"! Check it out in the market. #synthwave #newmusic',
            likes: 45,
            comments: 12,
            time: '2 hours ago'
        },
        {
            id: 'p2',
            author: 'Luna',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
            content: 'Working on something special for my premium affiliates. Stay tuned! 🎹',
            likes: 89,
            comments: 24,
            time: '5 hours ago'
        }
    ],
    messages: [
        {
            id: 'm1',
            from: 'BassHead_22',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bass',
            content: 'Hey! I just bought "Neon Nights", but the download link expired. Can you help?',
            time: '10 mins ago',
            read: false
        },
        {
            id: 'm2',
            from: 'VenuePromoter',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Venue',
            content: 'Love your sound. Would you be interested in a gig next month?',
            time: '1 day ago',
            read: true
        }
    ],
    affiliateStats: {
        totalEarnings: 1250.50,
        activeLinks: 12,
        totalClicks: 3450,
        conversionRate: 4.2
    },
    affiliateLinks: [
        {
            id: 'al1',
            songTitle: 'Neon Nights',
            code: 'FELIX-NEON-22',
            clicks: 1240,
            sales: 52,
            commission: 104.00,
            url: 'soundprofit.com/track/1?ref=FELIX-NEON-22'
        },
        {
            id: 'al2',
            songTitle: 'Bass Drop Protocol',
            code: 'BASS-PRO-99',
            clicks: 850,
            sales: 35,
            commission: 140.00,
            url: 'soundprofit.com/track/3?ref=BASS-PRO-99'
        }
    ]
};
