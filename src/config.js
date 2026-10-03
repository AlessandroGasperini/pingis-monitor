export const config = {
  timezone: "Europe/Stockholm",

  facilities: [
    {
      id: 2505,
      name: "TSK Malmen",
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
    weekdays: [1, 2, 3, 4, 6,], // Monday-Thursday
    startHour: 16,
    endHour: 22,
  },
};
