-- ============================================================
-- Seed: Lalitpur & Bhaktapur — 10 entries per category
-- user_id = 1 | status = 'approved'
-- Run in SSMS or sqlcmd after schema is applied
-- ============================================================

DECLARE @l INT = (SELECT id FROM Districts WHERE slug = 'lalitpur' OR name = 'Lalitpur');
DECLARE @b INT = (SELECT id FROM Districts WHERE slug = 'bhaktapur' OR name = 'Bhaktapur');

IF @l IS NULL RAISERROR('Lalitpur district not found in Districts table.', 16, 1);
IF @b IS NULL RAISERROR('Bhaktapur district not found in Districts table.', 16, 1);

-- ============================================================
-- LALITPUR — ATTRACTIONS
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@l, 1, 'patan-durbar-square-ltp', 'Patan Durbar Square', 'attraction', 'Mangal Bazaar, Lalitpur',
 'One of the three royal squares of the Kathmandu Valley and a UNESCO World Heritage Site. Patan Durbar Square is the cultural heart of Lalitpur, packed with ancient temples, stone sculptures, and the magnificent 17th-century Krishna Mandir. The square offers an unrivalled showcase of classical Newari craftsmanship.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.9, 0),

(@l, 1, 'krishna-mandir-patan-ltp', 'Krishna Mandir', 'attraction', 'Patan Durbar Square, Lalitpur',
 'An extraordinary all-stone temple built in 1637 by King Siddhi Narsingh Malla. Krishna Mandir features 21 golden pinnacles and intricate stone carvings depicting scenes from the Mahabharata and Ramayana along every floor. It remains one of the finest examples of Newari stone architecture in Nepal.',
 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.8, 0),

(@l, 1, 'patan-museum-ltp', 'Patan Museum', 'attraction', 'Patan Durbar Square, Lalitpur',
 'Considered the finest museum in Nepal, the Patan Museum occupies the 17th-century royal palace and houses an outstanding collection of bronze, stone, and wood artworks. A painstakingly restored courtyard and state-of-the-art displays bring Newar religious art vividly to life.',
 'https://images.unsplash.com/photo-1582610116397-edb72942ef35?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.8, 0),

(@l, 1, 'golden-temple-patan-ltp', 'Golden Temple (Kwa Bahal)', 'attraction', 'Hiranya Varna Mahavihar, Lalitpur',
 'Also called Hiranya Varna Mahavihar, this stunning 12th-century Buddhist monastery is covered in gilded roofs and hammered metalwork. A sacred tortoise guards the entrance and a three-roofed central shrine glows under a sea of butter lamps. Monks still chant here daily.',
 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.7, 0),

(@l, 1, 'mahabouddha-temple-ltp', 'Mahabouddha Temple', 'attraction', 'Oku Bahal, Lalitpur',
 'Nicknamed "Temple of a Thousand Buddhas", this terra-cotta shikhara-style tower is encrusted with nearly ten thousand Buddha images on every brick. Hidden inside a tight courtyard in the old city, it feels like a discovery even for repeat visitors and is one of the most photographed temples in Patan.',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.7, 0),

(@l, 1, 'kumbeshwar-temple-ltp', 'Kumbeshwar Temple', 'attraction', 'Kumbeshwar, Lalitpur',
 'Lalitpur''s only five-storied temple dedicated to Shiva, dating back to 1392. Its central tank is believed to be fed directly from the holy Gosaikunda Lake high in the Himalayas. Devotees come during Janai Purnima to bathe in the sacred water and receive the holy thread.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.6, 0),

(@l, 1, 'rato-machhendranath-temple-ltp', 'Rato Machhendranath Temple', 'attraction', 'Bungamati Road, Lalitpur',
 'Home to the rain deity revered by both Hindus and Buddhists, this temple is the starting point of the famous Rato Machhendranath chariot festival — the longest chariot festival in Nepal. The four-storied pagoda sits within a large open courtyard and is elaborately decorated during festivals.',
 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.6, 0),

(@l, 1, 'ashoka-stupas-patan-ltp', 'Ashoka Stupas of Patan', 'attraction', 'Four corners of Patan, Lalitpur',
 'Four ancient Buddhist stupas marking the four cardinal boundaries of Patan, traditionally attributed to Emperor Ashoka circa 250 BCE. Each mound-shaped stupa is adorned with prayer flags and butter lamps. Walking the circuit of all four is a meditative half-day experience through Lalitpur''s old neighbourhoods.',
 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@l, 1, 'jawlakhel-zoo-ltp', 'Jawlakhel Zoo', 'attraction', 'Jawlakhel, Lalitpur',
 'The oldest zoo in Nepal, established in 1932, and home to the Bengal tiger, one-horned rhinoceros, red panda, gharial crocodile, and hundreds of bird species. The zoo is particularly popular with families on weekends and is well kept by South Asian standards.',
 'https://images.unsplash.com/photo-1582610116397-edb72942ef35?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0),

(@l, 1, 'patan-ghat-ltp', 'Patan Ghat', 'attraction', 'Bagmati Riverbank, Lalitpur',
 'A serene riverside bathing ghat along the Bagmati River lined with ancient stone temples, crematoria, and resting houses. Less crowded than Pashupatinath, Patan Ghat offers an authentic glimpse into daily Hindu ritual life and is especially atmospheric at dawn when priests perform aarti.',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.4, 0);

-- ============================================================
-- LALITPUR — FOOD
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@l, 1, 'honacha-newari-food-ltp', 'Honacha', 'food', 'Mangal Bazaar, Lalitpur',
 'A legendary spot for traditional Newari food that has been feeding locals for generations. The thali here includes buffalo choila, bara, aloo tama, kwati, and a generous portion of chiura. There are no menus — you sit and the food arrives. Cash only and always crowded at lunch.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.7, 0),

(@l, 1, 'samay-baji-patan-ltp', 'Samay Baji at Old Quarter', 'food', 'Patan Old Town, Lalitpur',
 'Samay Baji is the quintessential Newari feast — a spread of chiura (beaten rice), spiced egg, buffalo meat, soybean nuggets, ginger pickle, and local wine served in a large bamboo tray. Several traditional shops along Patan''s old quarter streets serve this throughout the day.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@l, 1, 'chatamari-street-ltp', 'Chatamari Street Stalls', 'food', 'Oku Bahal, Lalitpur',
 'Chatamari — often called the Newari pizza — is a thin rice-flour crepe topped with minced meat, egg, and spices. Small family-run stalls near Mahabouddha and Oku Bahal cook these fresh on round griddles. The best time to visit is morning when the batter is freshest.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@l, 1, 'bara-stalls-patan-ltp', 'Bara Stalls at Mangal Bazaar', 'food', 'Mangal Bazaar, Lalitpur',
 'Bara are thick lentil pancakes cooked on iron griddles — a popular Newari street snack found at numerous stalls around Mangal Bazaar. Topped with egg and served with a tangy tomato pickle, they make for a cheap and filling snack at any hour. Look for the iron pans and the crowd.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@l, 1, 'kwati-shop-lalitpur-ltp', 'Kwati House', 'food', 'Lagankhel, Lalitpur',
 'Kwati is a nutrient-dense soup of nine types of sprouted beans slow-cooked with spices — traditionally eaten during Janai Purnima. This modest shop near Lagankhel serves it year-round alongside sel roti and achar. A bowl costs next to nothing and is enormously comforting on cold days.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.4, 0),

(@l, 1, 'jhamsikhel-food-street-ltp', 'Jhamsikhel Food Street', 'food', 'Jhamsikhel, Lalitpur',
 'A lively stretch of street food vendors in the expat-heavy Jhamsikhel neighbourhood. You''ll find everything from buff momos and sekuwa skewers to sukuti (dried meat) and sel roti alongside cold Tongba beer stalls. Busiest on Friday and Saturday evenings.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@l, 1, 'sel-roti-bakery-ltp', 'Sel Roti Bakery Lane', 'food', 'Jawlakhel, Lalitpur',
 'Sel Roti is a hollow, ring-shaped rice bread fried to a perfect crisp outside with a soft interior. A cluster of home bakeries along this lane near Jawlakhel has been making them fresh since early morning. Best eaten warm with a cup of chiya from the adjacent tea stall.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.3, 0),

(@l, 1, 'dhindo-house-patan-ltp', 'Dhindo House Patan', 'food', 'Kumaripati, Lalitpur',
 'Dhindo — a thick porridge of buckwheat or millet — is one of Nepal''s most traditional staples, rarely found in restaurants catering to tourists. This small home-kitchen in Kumaripati serves it with gundruk soup, mustard greens, and fresh curd. Genuinely local and very filling.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.4, 0),

(@l, 1, 'yomari-corner-patan-ltp', 'Yomari Corner', 'food', 'Sundhara, Lalitpur',
 'Yomari are steamed, fish-shaped dumplings filled with chaku (molasses and sesame) or khuwa (reduced milk). Traditionally made during Yomari Punhi festival, this small family shop keeps the tradition alive year-round. A dozen pieces paired with butter tea is one of Patan''s most unique treats.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@l, 1, 'aloo-tama-stall-ltp', 'Aloo Tama Stall', 'food', 'Pulchowk, Lalitpur',
 'Aloo Tama is a beloved Newari curry of potato and fermented bamboo shoots cooked with black-eyed peas in a tangy, aromatic broth. This unassuming roadside stall near Pulchowk engineering campus serves it with rice and has been feeding students and locals for over two decades.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.3, 0);

-- ============================================================
-- LALITPUR — RESTAURANTS
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@l, 1, 'cafe-de-patan-restaurant-ltp', 'Café de Patan', 'restaurant', 'Patan Durbar Square, Lalitpur',
 'Perched directly on Patan Durbar Square with rooftop views of the Krishna Mandir and surrounding temples, Café de Patan serves continental dishes, Nepali dal-bhat, and excellent wood-fired pizza. Sunset here over the pagodas is simply breathtaking — booking ahead is strongly advised.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.7, 0),

(@l, 1, 'roadhouse-cafe-patan-ltp', 'Roadhouse Café Patan', 'restaurant', 'Kupondole, Lalitpur',
 'A local institution known for the best wood-fired pizza in the valley, Roadhouse Café in Kupondole draws a loyal expat and local crowd. The dough is fermented for 24 hours and the tomato sauce is imported Italian. The garlic bread alone is worth the visit.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.6, 0),

(@l, 1, 'bhojan-griha-patan-ltp', 'Bhojan Griha', 'restaurant', 'Thapathali, Lalitpur',
 'Set inside a beautifully restored 150-year-old Rana-era mansion, Bhojan Griha offers a theatrical Nepali dining experience with live folk music, classical dance performances, and an elaborate set menu of Newari and Nepali dishes. Perfect for a special occasion dinner.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.6, 0),

(@l, 1, 'dhokaima-cafe-ltp', 'Dhokaima Café', 'restaurant', 'Pulchowk, Lalitpur',
 'A charming garden café hidden in a traditional Newari courtyard in Pulchowk, Dhokaima serves honest Continental and Nepali food in a setting that feels like a secret garden. Organic ingredients, fair-trade coffee, and a commitment to local sourcing set it apart.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.7, 0),

(@l, 1, 'patan-museum-cafe-ltp', 'Patan Museum Café', 'restaurant', 'Patan Durbar Square, Lalitpur',
 'Tucked inside the stunning museum courtyard, this café serves excellent filter coffee, sandwiches, and cakes with the sound of a traditional water fountain in the background. Entry to the museum is required, but the experience of lunching inside a 300-year-old royal courtyard is priceless.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.5, 0),

(@l, 1, 'third-eye-patan-ltp', 'Third Eye Restaurant', 'restaurant', 'Jhamsikhel, Lalitpur',
 'A long-standing favourite serving Indian, Nepali, and Continental dishes with generous portions. Third Eye''s tandoori lamb chops and butter chicken are consistently praised, and the restaurant''s warm lighting and attentive service make it ideal for a relaxed family dinner.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@l, 1, 'bajra-restaurant-ltp', 'Bajra Restaurant', 'restaurant', 'Kopundole, Lalitpur',
 'Bajra specialises in traditional Newari cuisine served in an open-courtyard setting. The house speciality is the Bajra Thali — a spread of ten Newari dishes including choila, bara, aloo tama, and the rich buffalo soup known as chhwela. Vegetarian options are also available.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.5, 0),

(@l, 1, 'himalayan-java-patan-ltp', 'Himalayan Java Patan', 'restaurant', 'Lagankhel, Lalitpur',
 'Nepal''s beloved specialty coffee chain, with this branch being a favourite meeting spot for Lalitpur''s young professionals. Single-origin Nepali coffee, fresh breakfast wraps, and free Wi-Fi make it an ideal remote-working spot. The iced Americano with local honey is a signature must-try.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@l, 1, 'fusion-restaurant-patan-ltp', 'Fusion Restaurant', 'restaurant', 'Sanepa, Lalitpur',
 'A sophisticated rooftop restaurant in Sanepa that blends East Asian, Indian, and European flavours. The sesame-glazed chicken served in a wok alongside steamed momos is the standout dish. Great cocktail menu and one of the better wine lists in Lalitpur.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0),

(@l, 1, 'new-orleans-cafe-patan-ltp', 'New Orleans Café', 'restaurant', 'Kumaripati, Lalitpur',
 'A laid-back restaurant known for its slow-cooked ribs, homemade burgers, and an impressive craft beer selection. New Orleans Café hosts quiz nights, live acoustic sessions, and sports screenings, making it one of Lalitpur''s most social dining spots for the international community.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0);

-- ============================================================
-- LALITPUR — HOTELS
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@l, 1, 'summit-hotel-patan-ltp', 'Summit Hotel', 'hotel', 'Kopundole, Lalitpur',
 'Lalitpur''s most acclaimed heritage hotel, Summit Hotel sits in extensive landscaped gardens in Kopundole. The property blends traditional Nepali architecture with modern amenities — the outdoor heated pool, award-winning restaurant, and attentive service make it a favourite with diplomatic guests and discerning travellers.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.7, 0),

(@l, 1, 'hotel-himalayan-heritage-ltp', 'Hotel Himalayan Heritage', 'hotel', 'Pulchowk, Lalitpur',
 'A graceful mid-range hotel built in classic pagoda style on the quiet Pulchowk road. Rooms are spacious with handcrafted Newari woodwork, mountain-facing balconies in upper floors, and included breakfasts of Nepali and Continental dishes. Walking distance to Patan Durbar Square.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@l, 1, 'hotel-greenwich-village-ltp', 'Hotel Greenwich Village', 'hotel', 'Jhamsikhel, Lalitpur',
 'A contemporary boutique hotel in the heart of Jhamsikhel, surrounded by restaurants and cafés. Stylish rooms with high ceilings, a rooftop terrace, and a popular downstairs bar make this a great base for exploring both Lalitpur and Kathmandu, with quick access to the ring road.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@l, 1, 'hotel-green-lotus-ltp', 'Hotel Green Lotus', 'hotel', 'Sanepa, Lalitpur',
 'A well-priced hotel in the Sanepa neighbourhood offering clean, air-conditioned rooms, a garden terrace, and reliable Wi-Fi. The team is helpful with trek bookings and city tours. Popular with budget-conscious business travellers visiting the NGO corridor in Lalitpur.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.2, 0),

(@l, 1, 'cosy-hotel-patan-ltp', 'Cosy Hotel Patan', 'hotel', 'Kupandole, Lalitpur',
 'True to its name, the Cosy Hotel is a warm and intimate 20-room property with thoughtfully decorated rooms and a sun-drenched rooftop. Excellent homemade breakfast spreads, complimentary cycles for exploring the old city, and knowledgeable staff make it a consistent traveller favourite.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.5, 0),

(@l, 1, 'lalitpur-international-hotel-ltp', 'Lalitpur International Hotel', 'hotel', 'Lalitpur Ring Road',
 'A full-service four-star hotel on the Lalitpur ring road with 80 rooms, conference facilities, an indoor pool, and a multi-cuisine restaurant. Convenient for corporate events and large groups, with shuttle service to Tribhuvan Airport available on request.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.2, 0),

(@l, 1, 'hotel-namaskar-ltp', 'Hotel Namaskar', 'hotel', 'Ekantakuna, Lalitpur',
 'A peaceful retreat in the quieter southern part of Lalitpur, Hotel Namaskar offers garden-view rooms, a yoga deck, and an Ayurvedic massage centre. Ideal for travellers who want to be near the city without the noise — the property backs onto a small nature reserve.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0),

(@l, 1, 'yala-maya-hotel-ltp', 'Yala Maya Hotel', 'hotel', 'Mangal Bazaar, Lalitpur',
 'Positioned within steps of Patan Durbar Square, Yala Maya Hotel occupies a restored merchant house in the historic old city. Stone-carved windows, a traditional courtyard garden, and walls lined with Thangka paintings create an immersive heritage experience at a reasonable price.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@l, 1, 'hotel-patan-heritage-ltp', 'Hotel Patan Heritage', 'hotel', 'Durbar Marg, Lalitpur',
 'A modern hotel with a strong nod to Newari heritage. Terracotta tilework, carved wooden screens, and bronze fittings throughout the property evoke traditional Lalitpur craftsmanship. The rooftop restaurant serves Newari set meals with a direct view of the old city skyline.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0),

(@l, 1, 'hotel-mahendra-patan-ltp', 'Hotel Mahendra', 'hotel', 'Lagankhel, Lalitpur',
 'A reliable budget hotel near the main Lagankhel bus stand offering tidy rooms, hot showers, and a simple rooftop café. Particularly good value for solo backpackers and domestic travellers who need a no-fuss base close to Lalitpur''s bus connections.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 3.9, 0);

-- ============================================================
-- LALITPUR — STAY
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@l, 1, 'patan-ecohome-ltp', 'Patan Ecohome & Lodge', 'stay', 'Ekantakuna, Lalitpur',
 'An eco-conscious guesthouse set in a restored Newari farmhouse surrounded by organic vegetable gardens. Solar-powered hot water, compost toilets, and farm-to-table breakfasts make this a genuine sustainable stay. The hosts lead guided walks through nearby heritage zones and organic farms.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@l, 1, 'newari-courtyard-stay-ltp', 'Newari Courtyard Stay', 'stay', 'Oku Bahal, Lalitpur',
 'Sleep in a 200-year-old traditional Newari home built around an open courtyard. Your hosts are a fourth-generation local family who share morning tea in the courtyard, cook Newari breakfasts from scratch, and give insider guidance on the city. A truly authentic cultural immersion.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.8, 0),

(@l, 1, 'kwa-bahal-guesthouse-ltp', 'Kwa Bahal Guesthouse', 'stay', 'Golden Temple Lane, Lalitpur',
 'A simple, cheerful guesthouse steps from the Golden Temple. Rooms are small but spotlessly clean, decorated with local Thangka prints. The hosts speak excellent English, organise evening Newari cooking classes, and can arrange early morning temple visits before the tourist crowds arrive.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@l, 1, 'mangal-bazaar-bb-ltp', 'Mangal Bazaar Bed & Breakfast', 'stay', 'Mangal Bazaar, Lalitpur',
 'Waking up directly on the square to the sound of temple bells is an experience you''ll carry for years. This intimate B&B occupies the upper floors of a heritage merchant house and offers four large rooms with original carved wooden windows overlooking the temples of Patan Durbar Square.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.7, 0),

(@l, 1, 'jawlakhel-homestay-ltp', 'Jawlakhel Homestay', 'stay', 'Jawlakhel, Lalitpur',
 'A friendly family-run homestay in Jawlakhel — the hub of Tibetan carpet weaving workshops. The family will take you behind the scenes of their carpet workshop, serve home-cooked Tibetan and Nepali meals, and connect you to the tight-knit Tibetan refugee community nearby.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@l, 1, 'kopundole-garden-stay-ltp', 'Kopundole Garden Stay', 'stay', 'Kopundole, Lalitpur',
 'A spacious garden guesthouse in the leafy Kopundole neighbourhood popular with long-stay volunteers and NGO workers. Monthly rates are excellent, the garden is a wonderful place to unwind, and the owner makes extraordinary homemade jam from the property''s fruit trees.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0),

(@l, 1, 'heritage-courtyard-inn-ltp', 'Heritage Courtyard Inn', 'stay', 'Sundhara, Lalitpur',
 'A restored 18th-century courtyard home turned guesthouse with six individually decorated rooms. Each features handmade furniture crafted by local artisans. The rooftop terrace has a small library and is a fantastic spot for morning yoga with views over the old city rooftops.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@l, 1, 'ekantakuna-guesthouse-ltp', 'Ekantakuna Guesthouse', 'stay', 'Ekantakuna, Lalitpur',
 'A peaceful budget guesthouse on the quiet southern edge of Lalitpur. Simple rooms, an enclosed garden, and a communal kitchen make it popular with long-staying backpackers and solo female travellers. Close to the Ekantakuna hiking trails that climb into the surrounding hills.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.1, 0),

(@l, 1, 'lagankhel-guesthouse-ltp', 'Lagankhel Guesthouse', 'stay', 'Lagankhel, Lalitpur',
 'Centrally located near the main Lagankhel bus terminus, this functional guesthouse suits travellers looking to explore both Kathmandu and Lalitpur as a base. Clean rooms, reliable Wi-Fi, and a rooftop terrace with valley views. Buses and taxis are always available at the doorstep.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 0, 3.9, 0),

(@l, 1, 'sunway-heritage-boutique-ltp', 'Sunway Heritage Boutique', 'stay', 'Patan Old Town, Lalitpur',
 'A small boutique guesthouse combining heritage aesthetics with modern comfort. Eight rooms decorated with handwoven Dhaka fabric and original stonework, complimentary yoga sessions at dawn, and a curated Newari breakfasts using only local-market ingredients. Minimum two-night stay recommended.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.5, 0);

-- ============================================================
-- BHAKTAPUR — ATTRACTIONS
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@b, 1, 'bhaktapur-durbar-square-bkt', 'Bhaktapur Durbar Square', 'attraction', 'Bhaktapur Old Town',
 'The grandest of the three Kathmandu Valley Durbar Squares, Bhaktapur Durbar Square is a UNESCO World Heritage Site dense with medieval temples, palaces, and courtyards. The 55-Window Palace, the Golden Gate, and the National Art Gallery are all within its boundaries. An entry fee is charged but well worth every rupee.',
 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.9, 0),

(@b, 1, 'nyatapola-temple-bkt', 'Nyatapola Temple', 'attraction', 'Taumadhi Square, Bhaktapur',
 'The tallest temple in the Kathmandu Valley at 30 metres, Nyatapola Temple was built in 1702 by King Bhupatindra Malla and has stood through multiple earthquakes. Five stone platforms guard its entrance — each with a pair of mythical figures of increasing power. The view from the upper square at dusk is spectacular.',
 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.9, 0),

(@b, 1, 'bhairabnath-temple-bkt', 'Bhairabnath Temple', 'attraction', 'Taumadhi Square, Bhaktapur',
 'Standing opposite Nyatapola in Taumadhi Square, the three-tiered Bhairabnath Temple is dedicated to the fierce form of Shiva. The deity''s massive golden mask is displayed publicly only during the Bisket Jatra festival in April — the rest of the year a small brass image stands in its place.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.7, 0),

(@b, 1, 'pottery-square-bkt', 'Pottery Square (Talako Tol)', 'attraction', 'Suryamadhi, Bhaktapur',
 'A large open square where traditional Bhaktapur potters have thrown and sun-dried their distinctive terracotta pots for centuries. The square is covered with hundreds of drying pots and spinning wheels, creating a living museum. Potters welcome respectful observers and will demonstrate for a small tip.',
 'https://images.unsplash.com/photo-1582610116397-edb72942ef35?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.6, 0),

(@b, 1, 'dattatreya-square-bkt', 'Dattatreya Square', 'attraction', 'Dattatreya Tole, Bhaktapur',
 'The oldest part of Bhaktapur and historically its first durbar, Dattatreya Square hosts the Dattatreya Temple (believed built from a single tree), the ornate Peacock Windows, and a string of ancient monasteries. Less visited than the main Durbar Square, it preserves a more authentic neighbourhood atmosphere.',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.7, 0),

(@b, 1, '55-window-palace-bkt', '55-Window Palace', 'attraction', 'Bhaktapur Durbar Square',
 'Built over several reigns and completed in the 17th century, the 55-Window Palace is the finest example of Newari royal architecture. Its 55 intricately latticed peacock-wood windows face south over the durbar square and catch the afternoon light in a way that makes every photo extraordinary. The Golden Gate on its north face is equally stunning.',
 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.8, 0),

(@b, 1, 'changu-narayan-temple-bkt', 'Changu Narayan Temple', 'attraction', 'Changu, Bhaktapur',
 'Nepal''s oldest surviving temple, dating to the 4th century CE, sits atop a forested hill near Bhaktapur and is a UNESCO World Heritage Site. The compound holds some of the finest examples of Licchavi stone sculpture in existence, including a stunning two-metre Vishnu Trivikrama. A 45-minute uphill walk from Bhaktapur.',
 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.8, 0),

(@b, 1, 'siddha-pokhari-bkt', 'Siddha Pokhari', 'attraction', 'East Gate, Bhaktapur',
 'A large historic royal pond with stone-carved ghats at its perimeter, used by the Malla kings for ritual bathing and military exercises. Today it serves as a mirror reflecting the pagoda skyline of old Bhaktapur at dawn. Surrounded by gardens, it is a calm oasis at the edge of the old city.',
 'https://images.unsplash.com/photo-1582610116397-edb72942ef35?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@b, 1, 'national-art-gallery-bkt', 'National Art Gallery', 'attraction', 'Bhaktapur Durbar Square',
 'Housed in a wing of the Malla royal palace, this gallery holds an outstanding collection of tantric paintings, illustrated manuscripts, bronze castings, and religious woodwork spanning eight centuries. The painted scroll collection is among the finest in South Asia and is rarely seen anywhere else.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.5, 0),

(@b, 1, 'taumadhi-square-bkt', 'Taumadhi Square', 'attraction', 'Taumadhi, Bhaktapur',
 'Bhaktapur''s bustling secondary square sits below Nyatapola Temple and transforms at golden hour when amber light falls across the tiered rooftops and local families gather for evening tea. The square is the social heart of Bhaktapur and the epicentre of the annual Bisket Jatra New Year festival.',
 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.7, 0);

-- ============================================================
-- BHAKTAPUR — FOOD
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@b, 1, 'juju-dhau-stalls-bkt', 'Juju Dhau Stalls', 'food', 'Taumadhi Square, Bhaktapur',
 'Bhaktapur''s most famous culinary export, Juju Dhau ("King of Curds") is a thick, creamy yogurt set in traditional clay pots that gives it its distinctive earthy flavour. Small vendor stalls throughout Taumadhi Square and the old city sell it for a few rupees per pot. Absolutely unmissable.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.8, 0),

(@b, 1, 'bara-stall-taumadhi-bkt', 'Bara Corner Taumadhi', 'food', 'Taumadhi Square, Bhaktapur',
 'An early-morning institution where thick lentil bara are cooked on iron skillets and served with a runny egg on top and a side of achar. The cook has been here for over 30 years and the same regulars appear every morning. Arrive before 8am for the best experience.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@b, 1, 'yomari-bhaktapur-bkt', 'Yomari Workshop & Shop', 'food', 'Dattatreya Tole, Bhaktapur',
 'A family that has been making yomari — steamed rice-flour dumplings filled with molasses and sesame — since the festival was young. They produce them year-round for tourists and sell directly from their home workshop in Dattatreya. You can watch the fish-shaped dumplings being hand-moulded.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@b, 1, 'jeri-swari-bhaktapur-bkt', 'Jeri Swari Shop', 'food', 'Durbar Square Lane, Bhaktapur',
 'Jeri and Swari are crispy, oil-fried Newari snacks made from rice flour — similar to Indian jalebi but denser. This small shop fries them fresh in a giant iron wok and sells them by the plate alongside sweet molasses dip. A popular mid-morning snack for locals heading to the market.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.4, 0),

(@b, 1, 'sapu-mhicha-bhaktapur-bkt', 'Sapu Mhicha Alley', 'food', 'Old Town, Bhaktapur',
 'Sapu Mhicha is a hyper-local Bhaktapur speciality — bone marrow soup with spiced offal served in a clay bowl. Found only in a few alleys of the old town, it is one of the most adventurous food experiences in the valley and draws intrepid food travellers from across Nepal.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.3, 0),

(@b, 1, 'chiura-musya-bhaktapur-bkt', 'Chiura & Musya Stalls', 'food', 'Taumadhi, Bhaktapur',
 'A traditional Bhaktapur snack combination — chiura (dried beaten rice) served alongside musya (spiced dried peas) sold in small paper cones throughout the old city. Cheap, crunchy, and satisfying, this is the valley''s ultimate walkable street snack and a staple at every local gathering.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.2, 0),

(@b, 1, 'newari-thali-bhaktapur-bkt', 'Traditional Newari Thali Houses', 'food', 'Suryamadhi, Bhaktapur',
 'Several family-run thali houses in Suryamadhi neighbourhood serve full Newari set meals on a large brass plate. The spread includes buff choila, kachila (raw meat), aloo achar, spinach, rice, and a generous pour of local aila. Lunch service only, seating on traditional wooden benches.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@b, 1, 'sel-roti-durbar-bkt', 'Sel Roti at Durbar Lane', 'food', 'Near Durbar Square, Bhaktapur',
 'An elderly woman and her daughter make sel roti on a single gas ring at the end of a narrow lane off the main Durbar Square. The ring-shaped rice bread is pulled straight from the oil into a bamboo basket. They sell out by 10am most days — arrive early.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@b, 1, 'thimi-alu-bhatmas-bkt', 'Thimi Alu-Bhatmas Sadeko', 'food', 'Madhyapur Thimi, Bhaktapur',
 'In the neighbouring town of Thimi, roadside vendors serve alu-bhatmas sadeko — a fiery salad of roasted soybeans, boiled potatoes, fresh coriander, and chilli oil that locals eat as an afternoon snack. It is Thimi''s signature street food and one of the valley''s most addictive dishes.',
 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.4, 0),

(@b, 1, 'samay-baji-bhaktapur-bkt', 'Samay Baji Set — Old Town', 'food', 'Golmadhi, Bhaktapur',
 'Local homes along Golmadhi lane open their front rooms as informal eateries serving the full Newari Samay Baji feast. The spread here uses Bhaktapur-sourced buffalo and home-fermented aila liquor, making it subtly different from Patan versions. A genuinely lived-in experience.',
 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0);

-- ============================================================
-- BHAKTAPUR — RESTAURANTS
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@b, 1, 'cafe-nyatapola-bkt', 'Café Nyatapola', 'restaurant', 'Taumadhi Square, Bhaktapur',
 'Bhaktapur''s most photographed restaurant sits directly inside a 500-year-old pagoda structure in Taumadhi Square. Café Nyatapola serves Nepali, Continental, and Newari dishes from carved wooden windows with a front-row view of the soaring Nyatapola Temple. The masala tea and apple pie are famous.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 1, 0, 4.7, 0),

(@b, 1, 'peacock-restaurant-bkt', 'Peacock Restaurant', 'restaurant', 'Bhaktapur Durbar Square',
 'Occupying a prime position inside Bhaktapur Durbar Square with floor-to-ceiling carved windows overlooking the 55-Window Palace, Peacock Restaurant offers a refined menu of Nepali and Continental dishes. The lunchtime Nepali set — rice, dal, vegetables, and sweet — is outstanding value.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.5, 0),

(@b, 1, 'marco-polo-bhaktapur-bkt', 'Marco Polo Restaurant', 'restaurant', 'Near Durbar Square, Bhaktapur',
 'A well-regarded restaurant near the main square serving reliable pizza, pasta, and wood-smoked meats alongside a full Nepali menu. Marco Polo is one of the few places in Bhaktapur open from early breakfast through late dinner and is a dependable choice for solo travellers.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0),

(@b, 1, 'thakali-kitchen-bhaktapur-bkt', 'Thakali Kitchen Bhaktapur', 'restaurant', 'Suryamadhi, Bhaktapur',
 'Run by a family from the Thakali community of Mustang, this unpretentious restaurant serves the most authentic Thakali dal-bhat in the valley. The deep, smoky mustard-green soup and fluffy buckwheat bread are prepared exactly as they would be at 3,000 metres altitude.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@b, 1, 'nyatapola-garden-bkt', 'Nyatapola Garden Restaurant', 'restaurant', 'Taumadhi, Bhaktapur',
 'A terraced restaurant behind Nyatapola Temple with a lush courtyard garden and handmade furniture. The menu focuses on farm-fresh Nepali cuisine with standout dishes of organic lentil soup, garden greens with sesame, and slow-roasted chicken. A lovely dinner setting after a day of sightseeing.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@b, 1, 'bhadgaon-restaurant-bkt', 'Bhadgaon Restaurant', 'restaurant', 'East Gate, Bhaktapur',
 'One of Bhaktapur''s oldest tourist restaurants, still serving its original recipe Newari set thali to generations of return visitors. The platter presentation — all dishes in small clay bowls on a bamboo tray — has not changed since the 1980s, and neither have the loyal clientele.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.2, 0),

(@b, 1, 'cafe-de-temple-bkt', 'Café de Temple', 'restaurant', 'Dattatreya Square, Bhaktapur',
 'A quietly charming café overlooking the Dattatreya Square — far less busy than the Durbar Square eateries. Homemade apple cake, single-origin Nepali drip coffee, and a simple lunch menu. The owner collects old Bhaktapur photographs which line the walls and invite endless conversation.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@b, 1, 'old-city-restaurant-bkt', 'Old City Restaurant', 'restaurant', 'Golmadhi, Bhaktapur',
 'A family-run restaurant hidden in the residential Golmadhi quarter serving generous Nepali meals at neighbourhood prices. The homemade buffalo pickle and the slow-cooked black lentil dal (kalo daal) are simply extraordinary. There is no signboard — follow the smell of ghee and the sound of grinding stone.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@b, 1, 'durbar-square-cafe-bkt', 'Durbar Square Café', 'restaurant', 'Bhaktapur Durbar Square',
 'A compact café within the Durbar Square complex offering coffee, juice, and light Nepali snacks. The main draw is the second-floor terrace with a sweeping view of the Pashupatinath Chowk temples. Ideal for a morning coffee break while planning the rest of the day''s sightseeing.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.1, 0),

(@b, 1, 'bhaktapur-kitchen-bkt', 'Bhaktapur Kitchen', 'restaurant', 'Near Taumadhi, Bhaktapur',
 'A mid-range restaurant with an open kitchen where you can watch chefs prepare fresh momos, sekuwa, and wood-fired bread. The mushroom and cheese momos are among the best in the valley and the evening all-you-can-eat momo deal draws a lively crowd on weekends.',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0);

-- ============================================================
-- BHAKTAPUR — HOTELS
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@b, 1, 'hotel-golden-gate-bkt', 'Hotel Golden Gate', 'hotel', 'Golden Gate Lane, Bhaktapur',
 'The finest hotel in Bhaktapur, positioned just steps from the Golden Gate of the Durbar Square. Built in traditional Newari style with carved peacock windows and a central courtyard fountain, it offers luxurious rooms, a rooftop terrace bar, and an exceptional heritage breakfast. A landmark property.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.7, 0),

(@b, 1, 'shiva-guest-house-bkt', 'Shiva Guest House', 'hotel', 'Durbar Square, Bhaktapur',
 'A long-standing traveller favourite in the heart of the old city, Shiva Guest House has been run by the same family for three generations. Rooms with hand-carved window frames face the temple square — the sound of temple bells at dawn is included at no extra charge.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.4, 0),

(@b, 1, 'traditional-bhaktapur-inn-bkt', 'Traditional Bhaktapur Inn', 'hotel', 'Taumadhi Square, Bhaktapur',
 'A carefully restored 17th-century merchant residence converted into a charming inn. Rooms are furnished with antique Newari wooden beds, hand-woven Dhaka cotton, and oil lanterns. The top-floor open terrace offers an unobstructed view of the Nyatapola Temple by night.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@b, 1, 'hotel-heritage-inn-bkt', 'Hotel Heritage Inn', 'hotel', 'East of Durbar Square, Bhaktapur',
 'A well-managed mid-range hotel just outside the Durbar Square area. Modern rooms with clean bathrooms, reliable hot water, and a buffet breakfast of Continental and Nepali options. The courtyard garden is perfect for morning tea and the staff organise excellent cycling tours of the valley.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0),

(@b, 1, 'sunny-hotel-bhaktapur-bkt', 'Sunny Hotel', 'hotel', 'New Bhaktapur, Bhaktapur',
 'A clean, cheerful budget hotel on the outskirts of the old city with easy access by tempo from Kathmandu. Rooms are basic but well maintained, and the rooftop is a pleasant place to meet other travellers. Popular with Indian pilgrims visiting Changu Narayan and local tour groups.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 3.9, 0),

(@b, 1, 'hotel-pagoda-inn-bkt', 'Hotel Pagoda Inn', 'hotel', 'Suryamadhi, Bhaktapur',
 'A characterful boutique hotel housed in a traditional Newari townhouse on the quiet Suryamadhi lane. The terracotta-pot garden, shared rooftop terrace, and evening storytelling sessions by the owner — a local historian — make this one of the most memorable stays in Bhaktapur.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@b, 1, 'bhaktapur-guest-house-bkt', 'Bhaktapur Guest House', 'hotel', 'Near Pottery Square, Bhaktapur',
 'A friendly guesthouse next to Pottery Square, ideal for travellers who want to be woken by the sound of potters at work. Rooms face the square and guests can arrange pottery workshops with the local artisans. Breakfast includes fresh Juju Dhau from the neighbourhood dairy.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.4, 0),

(@b, 1, 'bhadgaon-hotel-bkt', 'Bhadgaon Hotel', 'hotel', 'Bhaktapur Old Town',
 'Named after Bhaktapur''s ancient name, this heritage hotel occupies two interconnected Newari buildings. Communal areas are decorated with Paubha paintings and bronze deity figures. The in-house Newari cuisine restaurant is worth a visit even for non-residents.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.2, 0),

(@b, 1, 'hotel-mandap-bkt', 'Hotel Mandap Bhaktapur', 'hotel', 'Golmadhi, Bhaktapur',
 'A newer property built in traditional style with modern plumbing and fire safety to match. The outdoor mandap (pavilion) in the courtyard is used for outdoor dining, evening fire-pit gatherings, and morning yoga. Excellent buffet breakfast with a rotating Newari dish daily.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.3, 0),

(@b, 1, 'peace-hotel-bhaktapur-bkt', 'Peace Hotel', 'hotel', 'East Gate Road, Bhaktapur',
 'A well-priced guesthouse on the main east gate road favoured by cycling tourists passing through on the Bhaktapur–Nagarkot route. Spacious rooms, secure bike storage, and a packed-lunch service for day treks. The family-run kitchen makes extraordinary sel roti breakfasts.',
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.0, 0);

-- ============================================================
-- BHAKTAPUR — STAY
-- ============================================================
INSERT INTO Places (district_id, created_by_user_id, slug, name, category, location_text, description, cover_image_url, status, is_featured, is_hidden_gem, rating, review_count) VALUES
(@b, 1, 'bhaktapur-heritage-homestay-bkt', 'Bhaktapur Heritage Homestay', 'stay', 'Taumadhi, Bhaktapur',
 'A family homestay inside a genuine 200-year-old Newari home steps from Taumadhi Square. The grandmother of the house gives morning Newari cooking lessons, your host walks you to the pottery square and neighbourhood temples, and evenings end with homemade aila and stories. Utterly unforgettable.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.9, 0),

(@b, 1, 'pottery-square-homestay-bkt', 'Pottery Square Homestay', 'stay', 'Suryamadhi, Bhaktapur',
 'Wake up to the rhythmic sound of potters spinning clay in the square below. Your hosts are a potter family who will teach you to throw a simple pot on a traditional kick wheel during your stay. Rooms are simple but incredibly charming, with hand-painted clay floors and natural wood beams.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.7, 0),

(@b, 1, 'taumadhi-homestay-bkt', 'Taumadhi Homestay', 'stay', 'Taumadhi Square, Bhaktapur',
 'A peaceful four-room homestay with windows that open directly onto Taumadhi Square. Your hosts prepare full Newari breakfasts each morning and escort guests to the early morning market. During festival season, the view from your window of the lit-up Nyatapola is simply extraordinary.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.8, 0),

(@b, 1, 'old-town-guesthouse-bkt', 'Old Town Guesthouse', 'stay', 'Golmadhi, Bhaktapur',
 'A welcoming guesthouse in the quiet Golmadhi quarter run by a retired school teacher and his family. Daily guided neighbourhood walks, free bicycle hire, and a breakfast of homemade breads and local preserves make this a thoroughly enjoyable base for exploring Bhaktapur''s hidden alleys.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 0, 4.5, 0),

(@b, 1, 'newari-village-stay-bkt', 'Newari Village Homestay', 'stay', 'Bode, Bhaktapur',
 'Located in the small Bode village adjacent to Bhaktapur, this homestay puts you in the heart of a living Newari community. Your hosts are farmers who also keep a small dairy. Meals are entirely home-grown and the experience of helping with the morning harvest is a highlight for many guests.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@b, 1, 'changu-narayan-homestay-bkt', 'Changu Narayan Trail Homestay', 'stay', 'Changu Village, Bhaktapur',
 'A simple stone-and-mud farmhouse homestay at the top of Changu hill, a ten-minute walk from the UNESCO-listed Changu Narayan Temple. The views across the valley are extraordinary at dawn. The family serves freshly harvested vegetables and homemade paneer for breakfast.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.7, 0),

(@b, 1, 'suryamadhi-family-stay-bkt', 'Suryamadhi Family Stay', 'stay', 'Suryamadhi, Bhaktapur',
 'A local family in the potters'' quarter rents three rooms in their traditional townhouse to travellers. Each morning begins with watching the family prepare clay pots before sunrise. Guests can participate in the glazing and drying process and take a small finished pot home as a souvenir.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.6, 0),

(@b, 1, 'dattatreya-guesthouse-bkt', 'Dattatreya Square Guesthouse', 'stay', 'Dattatreya Tole, Bhaktapur',
 'Quietly positioned on Dattatreya Square — Bhaktapur''s oldest and least touristy square — this four-room guesthouse is a haven of calm. The host is a retired Newari metalsmith whose workshop is on the ground floor, and guests are welcome to observe and learn. Perfect for slow travellers.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.5, 0),

(@b, 1, 'thimi-heritage-homestay-bkt', 'Thimi Heritage Homestay', 'stay', 'Madhyapur Thimi, Bhaktapur',
 'Thimi is famous for paper-maché mask making and terracotta craft, and this homestay is run by a master mask-maker whose work is exhibited in international museums. Guests get a full-day workshop in traditional mask painting, plus home-cooked Newari meals throughout their stay.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.8, 0),

(@b, 1, 'madhyapur-guesthouse-bkt', 'Madhyapur Thimi Guesthouse', 'stay', 'Madhyapur Thimi, Bhaktapur',
 'A peaceful rural guesthouse in the town of Thimi, midway between Bhaktapur and Kathmandu. Surrounded by rice paddies and mustard fields, this is one of the few places in the valley where you can still fall asleep to the sound of crickets. Excellent base for cycling both cities.',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&auto=format&fit=crop', 'approved', 0, 1, 4.4, 0);

-- ============================================================
-- Update ContributorStats for user 1
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM ContributorStats WHERE user_id = 1)
    INSERT INTO ContributorStats (user_id) VALUES (1);

UPDATE ContributorStats
SET places_submitted = places_submitted + 100,
    places_approved  = places_approved  + 100
WHERE user_id = 1;

PRINT 'Seed complete: 100 places inserted for Lalitpur and Bhaktapur.';
