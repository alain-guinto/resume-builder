/**
 * Contact form data: phone codes with flags, countries, cities.
 * Used by editor for autocomplete and phone code dropdown.
 */
(function (global) {
  const PHONE_CODES = [
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+1', flag: '🇨🇦', name: 'Canada' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: '+63', flag: '🇵🇭', name: 'Philippines' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+81', flag: '🇯🇵', name: 'Japan' },
    { code: '+86', flag: '🇨🇳', name: 'China' },
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil' },
    { code: '+52', flag: '🇲🇽', name: 'Mexico' },
    { code: '+34', flag: '🇪🇸', name: 'Spain' },
    { code: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+82', flag: '🇰🇷', name: 'South Korea' },
    { code: '+7', flag: '🇷🇺', name: 'Russia' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
    { code: '+90', flag: '🇹🇷', name: 'Turkey' },
    { code: '+48', flag: '🇵🇱', name: 'Poland' },
    { code: '+46', flag: '🇸🇪', name: 'Sweden' },
    { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
    { code: '+43', flag: '🇦🇹', name: 'Austria' },
    { code: '+32', flag: '🇧🇪', name: 'Belgium' },
    { code: '+353', flag: '🇮🇪', name: 'Ireland' },
    { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
    { code: '+47', flag: '🇳🇴', name: 'Norway' },
    { code: '+45', flag: '🇩🇰', name: 'Denmark' },
    { code: '+358', flag: '🇫🇮', name: 'Finland' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal' },
    { code: '+30', flag: '🇬🇷', name: 'Greece' },
    { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
    { code: '+36', flag: '🇭🇺', name: 'Hungary' },
    { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
    { code: '+972', flag: '🇮🇱', name: 'Israel' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+20', flag: '🇪🇬', name: 'Egypt' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: '+51', flag: '🇵🇪', name: 'Peru' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
    { code: '+66', flag: '🇹🇭', name: 'Thailand' },
    { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
    { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
    { code: '+98', flag: '🇮🇷', name: 'Iran' },
  ];

  const COUNTRIES = [
    'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
    'Bahrain','Bangladesh','Belarus','Belgium','Belize','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Bulgaria','Burkina Faso',
    'Cambodia','Cameroon','Canada','Chile','China','Colombia','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
    'Denmark','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland','France',
    'Georgia','Germany','Ghana','Greece','Guatemala','Hong Kong','Hungary',
    'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
    'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan',
    'Laos','Latvia','Lebanon','Lithuania','Luxembourg',
    'Malaysia','Malta','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
    'Nepal','Netherlands','New Zealand','Nigeria','North Macedonia','Norway',
    'Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Poland','Portugal','Puerto Rico',
    'Qatar','Romania','Russia','Rwanda',
    'Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria',
    'Taiwan','Tajikistan','Tanzania','Thailand','Tunisia','Turkey',
    'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
    'Venezuela','Vietnam',
    'Zambia','Zimbabwe'
  ];

  const CITIES = [
    'Amsterdam','Athens','Atlanta','Auckland','Austin','Barcelona','Beijing','Berlin','Boston','Brussels','Budapest','Buenos Aires',
    'Cairo','Calgary','Chicago','Copenhagen','Dallas','Delhi','Denver','Detroit','Dubai','Dublin','Düsseldorf',
    'Edinburgh','Frankfurt','Geneva','Hamburg','Helsinki','Hong Kong','Houston','Istanbul',
    'Jakarta','Johannesburg','Kiev','Kuala Lumpur','Lagos','Lima','Lisbon','London','Los Angeles','Luxembourg',
    'Madrid','Manila','Melbourne','Mexico City','Miami','Milan','Montreal','Moscow','Munich',
    'New York','Oslo','Paris','Philadelphia','Phoenix','Prague','Rio de Janeiro','Rome','Rotterdam',
    'San Diego','San Francisco','São Paulo','Seattle','Seoul','Shanghai','Singapore','Stockholm','Sydney',
    'Taipei','Tel Aviv','Tokyo','Toronto','Vancouver','Vienna','Warsaw','Washington','Zurich'
  ];

  global.CONTACTS_DATA = { PHONE_CODES, COUNTRIES, CITIES };
})(typeof window !== 'undefined' ? window : this);
