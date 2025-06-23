export const theme = {
  name: 'wallet-theme',
  tokens: {
    colors: {
      font: {
        primary: 'black', // make all text white
      },
      brand: {
        primary: {
          10: '#7c9eb2',   // airSuperiorityBlue (lighter blue)
          80: '#52528c',   // purple-ish
          100: '#372554',  // dark violet
        },
      },
      border: {
        primary: '#7c9eb2',
      },
    },
    components: {
      button: {
        primary: {
          backgroundColor: '#52528c',
          color: '#ffffff',
          _hover: {
            backgroundColor: '#7c9eb2', // blue shade for hover
            color: '#ffffff',  // readable text on hover
          },
        },
      },
    },
  },
};
