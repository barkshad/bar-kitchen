
import { AppData } from './types';

export const initialData: AppData = {
  hero: {
    title: 'Where Kilifi Comes Alive — <span class="text-primary">Eat. Sip. Vibe.</span>',
    subtitle: "Fresh seafood, wood-fired BBQ and crafted cocktails."
  },
  about: "Discover coastal flavours, vibrant nights & local energy at Generali's Bar & Kitchen, Kilifi. We believe in good food made for good company, served in a space that feels like home. From our kitchen to your table, it's all about the vibe.",
  specials: `
<p>🍴 <strong>Say Goodbye to Monday Blues!</strong></p>
<p><strong>Fresh, Flavorful & Fast Deliveries within Kilifi and its Environs 🌴🚗</strong></p>
<br>
<p><strong>🥘 Our Specials:</strong></p>
<ul>
    <li>Chips with Pan-Fried Chicken — <strong>KSh 450</strong></li>
    <li>Chips Masala with Crispy Chicken — <strong>KSh 600</strong></li>
    <li>¼ Beef Pan-Fry with Ugali & Kachumbari — <strong>KSh 400</strong></li>
    <li>¼ Mbuzi Wet Fry with Ugali & Greens — <strong>KSh 500</strong></li>
    <li>¼ Beef Wet Fry with Chips — <strong>KSh 450</strong></li>
    <li>Sautéed Potatoes with 2 Sausages — <strong>KSh 300</strong></li>
    <li>¼ Beef Wet Fry with Ugali — <strong>KSh 350</strong></li>
    <li>Ask for our Special <strong>Kuku Kienyeji</strong> — Price on Request</li>
</ul>
<br>
<p>📞 <strong>To place your order:</strong> Call or WhatsApp <strong>0723 836 288</strong></p>
<p><em>Fast delivery, hot meals, happy vibes 🎉</em></p>`,
  menu: {
    overview: [
      { title: 'BBQ', items: [{ name: 'BBQ Platter', price: 'KSh 1,950', image: 'https://picsum.photos/400/300?random=1' }, { name: 'Grilled Lamb Chops', price: 'KSh 1,250' }, { name: 'Charred Corn', price: 'KSh 250' }] },
      { title: 'Pizza', items: [{ name: 'Margherita', price: 'KSh 850' }, { name: 'Pepperoni', price: 'KSh 1,050' }, { name: 'Seafood Delight', price: 'KSh 1,250', image: 'https://picsum.photos/400/300?random=2' }] },
      { title: 'Seafood', items: [{ name: 'Seafood Tapas', price: 'KSh 1,450', image: 'https://picsum.photos/400/300?random=3' }, { name: 'Grilled Prawns', price: 'KSh 1,350' }] },
      { title: 'Cocktails', items: [{ name: 'Generali Mule', price: 'KSh 650' }, { name: 'Mango Rum Punch', price: 'KSh 700' }] },
    ],
    fullMenu: [
        { title: 'Starters', items: [{ name: 'Ceviche', price: 'KSh 650' }, {name: 'Calamari Rings', price: 'KSh 550'}] },
        { title: 'Mains', items: [{ name: 'Charcoal-Grilled Fish', price: 'KSh 1,350', image: 'https://picsum.photos/400/300?random=4' }, {name: 'BBQ Platter', price: 'KSh 1,950', image: 'https://picsum.photos/400/300?random=5'}] },
        { title: 'Desserts', items: [{ name: 'Coconut Tart', price: 'KSh 450' }, {name: 'Mango Sorbet', price: 'KSh 400'}] },
    ]
  },
  events: [
    { image: 'https://picsum.photos/800/600?random=6', title: 'Live DJ Nights', date: 'Every Friday & Saturday', description: "Experience the best of Kilifi's nightlife with our resident DJs spinning the latest tracks from 8pm till late. No cover charge before 9pm." },
    { image: 'https://picsum.photos/800/600?random=7', title: 'Weekend BBQ Bash', date: 'Saturdays from 6pm', description: 'Join us for a family-friendly BBQ every Saturday. Enjoy our famous grilled platters, great music, and a relaxed atmosphere.' },
    { image: 'https://picsum.photos/800/600?random=8', title: 'Happy Hour Specials', date: 'Weekdays 3pm — 6pm', description: 'Unwind after a long day with our happy hour. Enjoy special prices on select cocktails, beers, and tapas.' }
  ],
  gallery: [
    { src: 'https://picsum.photos/800/600?random=9', caption: 'Vibrant cocktails lined up on the bar.' },
    { src: 'https://picsum.photos/800/600?random=10', caption: 'A delicious and healthy meal served fresh.' },
    { src: 'https://picsum.photos/800/600?random=11', caption: 'Our chefs preparing a masterpiece in the kitchen.' },
    { src: 'https://picsum.photos/800/600?random=12', caption: 'Cozy and inviting atmosphere for a perfect night out.' }
  ],
  testimonials: [
    { quote: "The seafood platter was absolutely divine! Freshest I've had in Kilifi. The vibe is amazing, perfect for a chill evening with friends.", author: "Asha N.", location: "Frequent Visitor" },
    { quote: "Generali's never disappoints. Their BBQ is legendary and the cocktails are a work of art. A must-visit spot on the coast.", author: "David M.", location: "Nairobi Tourist" },
    { quote: "We hosted a birthday party here and the staff were incredibly accommodating. The food was a hit with everyone. Highly recommend!", author: "Fatima K.", location: "Kilifi Resident" }
  ],
  team: [
      { image: 'https://picsum.photos/500/500?random=13', name: 'Chef Juma', role: 'Head Chef', bio: 'With over 15 years of experience in coastal cuisine, Chef Juma brings a passion for fresh, local ingredients to every dish he creates.' },
      { image: 'https://picsum.photos/500/500?random=14', name: 'Maria', role: 'Bar Manager', bio: 'Our master mixologist, Maria, crafts unique cocktails that capture the spirit of Kilifi. Ask her for her signature Generali Mule!' }
  ],
  rules: [
      'Smart casual recommended. No swimwear or flip-flops after 6pm.',
      'We reserve the right of admission.',
      'Please respect staff and other guests — loud or abusive behaviour will not be tolerated.'
  ],
  contact: {
    address: 'Kwa Mwango, Kilifi Town — opposite the new Fire Station.',
    phone: '+254 723 836 288',
  }
};
