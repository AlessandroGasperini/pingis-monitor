export const config = {
  timezone: "Europe/Stockholm",

  facilities: [
    {
      id: 2505,
      name: "TSK Malmen",
      nickname: "Malmen",
    },
    {
      id: 1931,
      name: "Stockholms Tennishall & Stockholms TK",
      nickname: "Krickan TSK",
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
    weekdays: [1, 2, 3, 4],
    hoursByWeekday: {
      1: { start: 18, end: 21 },
      2: { start: 18, end: 20 },
      3: { start: 18, end: 21 },
      4: { start: 18, end: 20 },
    },
  },
};
