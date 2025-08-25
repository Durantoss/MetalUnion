#!/usr/bin/env node

/**
 * Script to populate Supabase database with sample data
 * This will fix the "no information populating" issue on moshunion.netlify.app
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://jxrkgdqhynesvdnbhgzu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cmtnZHFoeW5lc3ZkbmJoZ3p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA3MjM3OSwiZXhwIjoyMDcxNjQ4Mzc5fQ.E1ghlYGw0kGs3Ft-fbkR1_SlJd4nNv3r2xGlTg4v5Bs';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateDatabase() {
  console.log('🚀 Starting database population...');
  
  try {
    // Insert bands
    console.log('📀 Inserting bands...');
    const bandsData = [
      {
        id: 'band-1',
        name: 'Architects',
        genre: 'Metalcore',
        description: 'British metalcore band known for their technical prowess and emotional depth. Their blend of heavy breakdowns and melodic passages has made them one of the most influential bands in modern metal.',
        image_url: '/attached_assets/generated_images/Architects_band_photo_69a0cfaa.png',
        founded: 2004,
        members: ['Sam Carter', 'Josh Middleton', 'Alex Dean', 'Adam Christianson', 'Dan Searle'],
        albums: ['Nightmares', 'Daybreaker', 'Lost Forever // Lost Together', 'All Our Gods Have Abandoned Us', 'Holy Hell', 'For Those That Wish to Exist'],
        website: 'https://architectsofficial.com',
        instagram: 'https://instagram.com/architectsofficial',
        status: 'approved',
        approved_at: new Date().toISOString()
      },
      {
        id: 'band-2',
        name: 'Sleep Token',
        genre: 'Progressive Metal',
        description: 'Anonymous collective blending metal with pop sensibilities. Their mysterious identity and genre-defying sound has captivated audiences worldwide with emotional vulnerability wrapped in heavy instrumentation.',
        image_url: '/attached_assets/generated_images/Sleep_Token_masked_band_d2eee2e7.png',
        founded: 2016,
        members: ['Vessel', 'II', 'III', 'IV'],
        albums: ['One', 'Two', 'Sundowning', 'This Place Will Become Your Tomb', 'Take Me Back to Eden'],
        website: 'https://sleep-token.com',
        instagram: 'https://instagram.com/sleep_token',
        status: 'approved',
        approved_at: new Date().toISOString()
      },
      {
        id: 'band-3',
        name: 'Spiritbox',
        genre: 'Metalcore',
        description: 'Canadian metalcore band featuring Courtney LaPlante\'s versatile vocals ranging from ethereal cleans to devastating screams. Their modern approach to metalcore has earned critical acclaim.',
        image_url: '/attached_assets/generated_images/Spiritbox_band_photo_fb4a5c9c.png',
        founded: 2017,
        members: ['Courtney LaPlante', 'Mike Stringer', 'Bill Crook', 'Zev Rose'],
        albums: ['Spiritbox', 'Eternal Blue'],
        website: 'https://spiritbox.com',
        instagram: 'https://instagram.com/spiritboxband',
        status: 'approved',
        approved_at: new Date().toISOString()
      },
      {
        id: 'band-4',
        name: 'Lorna Shore',
        genre: 'Deathcore',
        description: 'American deathcore band known for their symphonic elements and Will Ramos\' incredible vocal range. Their theatrical approach to extreme metal has redefined the deathcore genre.',
        image_url: '/attached_assets/generated_images/Lorna_Shore_photo_9474087c.png',
        founded: 2009,
        members: ['Will Ramos', 'Adam De Micco', 'Andrew O\'Connor', 'Michael Yager'],
        albums: ['Psalms', 'Flesh Coffin', 'Immortal', 'Pain Remains'],
        website: 'https://lornashore.com',
        instagram: 'https://instagram.com/lornashore',
        status: 'approved',
        approved_at: new Date().toISOString()
      },
      {
        id: 'band-5',
        name: 'Bad Omens',
        genre: 'Alternative Metal',
        description: 'American rock band blending alternative metal with electronic elements. Their cinematic approach and Noah Sebastian\'s dynamic vocals have created a unique sound in modern rock.',
        image_url: '/attached_assets/generated_images/Bad_Omens_photo_bae5bfa0.png',
        founded: 2015,
        members: ['Noah Sebastian', 'Nicholas Ruffilo', 'Joakim Karlsson', 'Nick Folio'],
        albums: ['Bad Omens', 'Finding God Before God Finds Me', 'THE DEATH OF PEACE OF MIND'],
        website: 'https://badomensofficial.com',
        instagram: 'https://instagram.com/badomensband',
        status: 'approved',
        approved_at: new Date().toISOString()
      },
      {
        id: 'band-6',
        name: 'Bring Me The Horizon',
        genre: 'Alternative Rock',
        description: 'British rock band that evolved from deathcore to alternative rock. Their experimental approach and Oli Sykes\' evolution as a vocalist has made them one of the most successful modern rock acts.',
        image_url: '/attached_assets/generated_images/Bring_Me_Horizon_photo_f56c0efe.png',
        founded: 2004,
        members: ['Oliver Sykes', 'Lee Malia', 'Matt Kean', 'Matt Nicholls', 'Jordan Fish'],
        albums: ['Count Your Blessings', 'Suicide Season', 'There Is a Hell...', 'Sempiternal', 'That\'s the Spirit', 'amo', 'POST HUMAN: SURVIVAL HORROR'],
        website: 'https://bmthofficial.com',
        instagram: 'https://instagram.com/bringmethehorizon',
        status: 'approved',
        approved_at: new Date().toISOString()
      },
      {
        id: 'band-7',
        name: 'Ghost',
        genre: 'Heavy Metal',
        description: 'Swedish rock band known for their theatrical Satanic imagery and catchy melodies. Papa Emeritus and the Nameless Ghouls create a unique blend of horror and rock spectacle.',
        image_url: '/attached_assets/generated_images/Ghost_theatrical_band_b297ecc2.png',
        founded: 2006,
        members: ['Papa Emeritus IV', 'Nameless Ghouls'],
        albums: ['Opus Eponymous', 'Infestissumam', 'Meliora', 'Prequelle', 'IMPERA'],
        website: 'https://ghost-official.com',
        instagram: 'https://instagram.com/thebandghost',
        status: 'approved',
        approved_at: new Date().toISOString()
      },
      {
        id: 'band-8',
        name: 'Jinjer',
        genre: 'Progressive Metal',
        description: 'Ukrainian progressive metal band featuring Tatiana Shmayluk\'s incredible vocal versatility. Their technical musicianship and genre-blending approach has earned international recognition.',
        image_url: '/attached_assets/generated_images/Jinjer_progressive_metal_8f4045ae.png',
        founded: 2008,
        members: ['Tatiana Shmayluk', 'Roman Ibramkhalilov', 'Eugene Abdukhanov', 'Vladislav Ulasevich'],
        albums: ['Inhale, Don\'t Breathe', 'Cloud Factory', 'King of Everything', 'Macro', 'Wallflowers'],
        website: 'https://jinjer-metal.com',
        instagram: 'https://instagram.com/jinjer_official',
        status: 'approved',
        approved_at: new Date().toISOString()
      }
    ];

    const { data: bandsResult, error: bandsError } = await supabase
      .from('bands')
      .upsert(bandsData);

    if (bandsError) {
      console.error('❌ Error inserting bands:', bandsError);
      throw bandsError;
    }

    console.log('✅ Bands inserted successfully!');

    // Insert tours
    console.log('🎵 Inserting tours...');
    const toursData = [
      {
        id: 'tour-1',
        band_id: 'band-1',
        tour_name: 'The Classic Symptoms of a Broken Spirit Tour',
        venue: 'Madison Square Garden',
        city: 'New York',
        country: 'USA',
        date: '2024-03-15T20:00:00Z',
        ticket_url: 'https://ticketmaster.com/architects-nyc',
        price: '$45-85',
        status: 'upcoming',
        venue_capacity: 20000,
        current_attendance: 15000,
        crowd_energy_level: 0.85
      },
      {
        id: 'tour-2',
        band_id: 'band-2',
        tour_name: 'Take Me Back to Eden World Tour',
        venue: 'The Forum',
        city: 'Los Angeles',
        country: 'USA',
        date: '2024-03-22T19:30:00Z',
        ticket_url: 'https://ticketmaster.com/sleep-token-la',
        price: '$55-120',
        status: 'upcoming',
        venue_capacity: 17500,
        current_attendance: 17500,
        crowd_energy_level: 0.95
      },
      {
        id: 'tour-3',
        band_id: 'band-3',
        tour_name: 'Eternal Blue Tour',
        venue: 'House of Blues',
        city: 'Chicago',
        country: 'USA',
        date: '2024-04-05T20:00:00Z',
        ticket_url: 'https://livenation.com/spiritbox-chicago',
        price: '$35-65',
        status: 'upcoming',
        venue_capacity: 1800,
        current_attendance: 1200,
        crowd_energy_level: 0.78
      },
      {
        id: 'tour-4',
        band_id: 'band-4',
        tour_name: 'Pain Remains Tour',
        venue: 'The Fillmore',
        city: 'Philadelphia',
        country: 'USA',
        date: '2024-04-12T19:00:00Z',
        ticket_url: 'https://ticketmaster.com/lorna-shore-philly',
        price: '$40-75',
        status: 'upcoming',
        venue_capacity: 2500,
        current_attendance: 2100,
        crowd_energy_level: 0.88
      }
    ];

    const { data: toursResult, error: toursError } = await supabase
      .from('tours')
      .upsert(toursData);

    if (toursError) {
      console.error('❌ Error inserting tours:', toursError);
      throw toursError;
    }

    console.log('✅ Tours inserted successfully!');

    // Insert reviews
    console.log('⭐ Inserting reviews...');
    const reviewsData = [
      {
        id: 'review-1',
        band_id: 'band-1',
        stagename: 'MetalWarrior',
        rating: 5,
        title: 'Architects Live: Absolutely Devastating',
        content: 'Just saw Architects at Madison Square Garden and I\'m still processing what happened. Sam Carter\'s vocals were absolutely insane - the way he delivered "Doomsday" had the entire venue in tears. The new material from FTTWTE hits so much harder live. When they played "Gone With The Wind" the entire floor was a sea of movement. This band continues to push boundaries while honoring Tom\'s legacy beautifully. 10/10 would recommend to anyone who wants to feel something real.',
        review_type: 'concert',
        target_name: 'Madison Square Garden',
        likes: 47
      },
      {
        id: 'review-2',
        band_id: 'band-2',
        stagename: 'SleeplessInSeattle',
        rating: 5,
        title: 'Sleep Token: Genre-Defying Perfection',
        content: 'Sleep Token\'s latest album "Take Me Back to Eden" is a masterpiece that defies every expectation. Vessel\'s vocals on "Chokehold" are hauntingly beautiful, while "The Summoning" showcases their heaviest material yet. The way they blend pop sensibilities with crushing metal is unmatched. Each song feels like a journey through different emotions. This album will be remembered as a defining moment in modern metal.',
        review_type: 'album',
        target_name: 'Take Me Back to Eden',
        likes: 89
      },
      {
        id: 'review-3',
        band_id: 'band-3',
        stagename: 'CourtneyFan2023',
        rating: 4,
        title: 'Spiritbox: The Future of Metalcore',
        content: 'Spiritbox continues to impress with their innovative approach to metalcore. Courtney LaPlante\'s vocal range is absolutely incredible - she can go from angelic cleans to bone-crushing screams seamlessly. "Eternal Blue" showcases their songwriting maturity. The production is crisp and every instrument shines. My only complaint is that I want more! Can\'t wait to see what they do next.',
        review_type: 'band',
        target_name: '',
        likes: 34
      },
      {
        id: 'review-4',
        band_id: 'band-4',
        stagename: 'DeathcoreKing',
        rating: 5,
        title: 'Lorna Shore: Will Ramos is Inhuman',
        content: 'Will Ramos has single-handedly revitalized Lorna Shore and the entire deathcore scene. His vocal performance on "Pain Remains" trilogy is otherworldly. The symphonic elements blend perfectly with the crushing heaviness. "To the Hellfire" remains an absolute banger that never gets old. This band is pushing deathcore into new territories while respecting the genre\'s roots.',
        review_type: 'album',
        target_name: 'Pain Remains',
        likes: 76
      }
    ];

    const { data: reviewsResult, error: reviewsError } = await supabase
      .from('reviews')
      .upsert(reviewsData);

    if (reviewsError) {
      console.error('❌ Error inserting reviews:', reviewsError);
      throw reviewsError;
    }

    console.log('✅ Reviews inserted successfully!');

    // Insert photos
    console.log('📸 Inserting photos...');
    const photosData = [
      {
        id: 'photo-1',
        band_id: 'band-1',
        title: 'Architects Live at MSG',
        image_url: '/attached_assets/generated_images/Architects_band_photo_69a0cfaa.png',
        category: 'live',
        uploaded_by: 'ConcertPhotographer',
        description: 'Sam Carter commanding the stage during "Doomsday" - the emotion was palpable'
      },
      {
        id: 'photo-2',
        band_id: 'band-2',
        title: 'Sleep Token Ritual',
        image_url: '/attached_assets/generated_images/Sleep_Token_masked_band_d2eee2e7.png',
        category: 'live',
        uploaded_by: 'MysticalShots',
        description: 'The mysterious Vessel during an intimate acoustic moment'
      },
      {
        id: 'photo-3',
        band_id: 'band-3',
        title: 'Spiritbox Energy',
        image_url: '/attached_assets/generated_images/Spiritbox_band_photo_fb4a5c9c.png',
        category: 'live',
        uploaded_by: 'MetalcorePhotos',
        description: 'Courtney LaPlante delivering crushing vocals with incredible stage presence'
      },
      {
        id: 'photo-4',
        band_id: 'band-4',
        title: 'Lorna Shore Chaos',
        image_url: '/attached_assets/generated_images/Lorna_Shore_photo_9474087c.png',
        category: 'live',
        uploaded_by: 'DeathcoreShots',
        description: 'Will Ramos showcasing his incredible vocal range during "To the Hellfire"'
      }
    ];

    const { data: photosResult, error: photosError } = await supabase
      .from('photos')
      .upsert(photosData);

    if (photosError) {
      console.error('❌ Error inserting photos:', photosError);
      throw photosError;
    }

    console.log('✅ Photos inserted successfully!');

    // Insert pit messages
    console.log('💬 Inserting pit messages...');
    const pitMessagesData = [
      {
        id: 'pit-1',
        author_name: 'MetalWarrior',
        title: 'Best Metal Albums 2024',
        content: 'What are everyone\'s top picks for metal albums this year? I\'ve been obsessed with Sleep Token\'s "Take Me Back to Eden" and Lorna Shore\'s "Pain Remains". The production quality and songwriting on both are incredible. What else should I be listening to?',
        category: 'general',
        likes: 23,
        replies: 8,
        is_pinned: 0
      },
      {
        id: 'pit-2',
        author_name: 'RiffMaster',
        title: 'Wacken 2024 Lineup Thoughts',
        content: 'Just saw the Wacken lineup and I\'m so hyped! Architects, Ghost, and Jinjer all on the same festival? This is going to be legendary. Anyone else planning to make the trip to Germany? We should organize a MoshUnion meetup!',
        category: 'tours',
        likes: 45,
        replies: 12,
        is_pinned: 1
      },
      {
        id: 'pit-3',
        author_name: 'VocalCoach',
        title: 'Will Ramos Vocal Analysis',
        content: 'As someone who teaches vocals, I have to say Will Ramos from Lorna Shore is doing things that shouldn\'t be humanly possible. His technique on "To the Hellfire" is absolutely flawless. The way he transitions between different vocal styles is masterful. Any other vocalists here studying his technique?',
        category: 'bands',
        likes: 67,
        replies: 15,
        is_pinned: 0
      }
    ];

    const { data: pitResult, error: pitError } = await supabase
      .from('pit_messages')
      .upsert(pitMessagesData);

    if (pitError) {
      console.error('❌ Error inserting pit messages:', pitError);
      throw pitError;
    }

    console.log('✅ Pit messages inserted successfully!');

    // Verify data was inserted
    console.log('🔍 Verifying data insertion...');
    
    const { data: bandCount } = await supabase
      .from('bands')
      .select('*', { count: 'exact' })
      .eq('status', 'approved');

    const { data: tourCount } = await supabase
      .from('tours')
      .select('*', { count: 'exact' });

    const { data: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' });

    const { data: photoCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact' });

    const { data: pitCount } = await supabase
      .from('pit_messages')
      .select('*', { count: 'exact' });

    console.log('\n🎉 Database population completed successfully!');
    console.log('📊 Final counts:');
    console.log(`   • Approved Bands: ${bandCount?.length || 0}`);
    console.log(`   • Tours: ${tourCount?.length || 0}`);
    console.log(`   • Reviews: ${reviewCount?.length || 0}`);
    console.log(`   • Photos: ${photoCount?.length || 0}`);
    console.log(`   • Pit Messages: ${pitCount?.length || 0}`);
    console.log('\n✨ The site should now show populated data!');
    console.log('🌐 Check: https://moshunion.netlify.app');

  } catch (error) {
    console.error('💥 Error populating database:', error);
    process.exit(1);
  }
}

// Run the population script
populateDatabase();
