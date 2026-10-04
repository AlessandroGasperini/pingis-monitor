export const config = {
  timezone: "Europe/Stockholm",

  facilities: [
    {
      id: 2505,
      name: "TSK Malmen",
    },
    {
  id: 1931,
  name: "Stockholms Tennishall & Stockholms TK",
},
  ],

  sport: 1,

  search: {
    lat: "",
    lng: "",
    offset: 0,
    outdoors: "",
    hasCamera: "",
  },

 monitoring: {
   daysAhead: 21,
   weekdays: [1, 2, 3, 4], // Mån–tors
   hoursByWeekday: {
    1: { start: 18, end: 21 }, // Måndag
    2: { start: 18, end: 20 }, // Tisdag
    3: { start: 18, end: 21 }, // Onsdag
    4: { start: 18, end: 20 }, // Torsdag
  },
},
};
