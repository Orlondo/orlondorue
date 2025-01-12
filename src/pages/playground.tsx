import React, { useState } from 'react'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _map from 'lodash/map'
import _isEqual from 'lodash/isEqual'
import _omit from 'lodash/omit'
import _uniqWith from 'lodash/uniqWith'

export default () => {
  const [value, setValue] = useState(0)
  const savedOrders = [
    {
      locationNumber: '-1',
      orderId: 1884027,
      items: [
        {
          itemId: 101430,
          quantity: 1,
          menuItemCode: 'HNR-DOUBLEPCC',
        },
      ],
    },
    {
      locationNumber: '-1',
      orderId: 1884034,
      items: [
        {
          itemId: 101463,
          quantity: 1,
          menuItemCode: 'HNR-4QUARTERC',
        },
        {
          itemId: 101279,
          quantity: 1,
          menuItemCode: 'HNR-BUFCCKP',
        },
        {
          itemId: 101277,
          quantity: 1,
          menuItemCode: 'HNR-GPC1',
        },
      ],
    },
    {
      locationNumber: '-1',
      orderId: 1884049,
      items: [
        {
          itemId: 101278,
          quantity: 1,
          menuItemCode: 'HNR-BBQCCKP',
        },
      ],
    },
    {
      locationNumber: '-1',
      orderId: 1884098,
      items: [
        {
          itemId: 101431,
          quantity: 1,
          menuItemCode: 'HNR-BACONBL',
        },
      ],
    },
    {
      locationNumber: '-1',
      orderId: 1884099,
      items: [
        {
          itemId: 101431,
          quantity: 1,
          menuItemCode: 'HNR-BACONBL',
        },
      ],
    },
    {
      locationNumber: '-1',
      orderId: 1884100,
      items: [
        {
          itemId: 101431,
          quantity: 1,
          menuItemCode: 'HNR-BACONBL',
        },
      ],
    },
    {
      locationNumber: '-1',
      orderId: 1884245,
      items: [
        {
          itemId: 201058,
          quantity: 1,
          menuItemCode: 'HNR-BWDDD',
        },
      ],
    },

    {
      locationNumber: '-1',
      orderId: 1884320,
      items: [
        {
          itemId: 101430,
          quantity: 1,
          menuItemCode: 'HNR-DOUBLEPCC',
        },
      ],
    },
    {
      locationNumber: '-1',
      orderId: 1884323,
      items: [
        {
          itemId: 101430,
          quantity: 1,
          menuItemCode: 'HNR-DOUBLEPCC',
        },
      ],
    },
  ]

  const currentOrder = [
    {
      locationNumber: '-1',
      orderId: 1884320,
      items: [
        {
          itemId: 101430,
          quantity: 1,
          menuItemCode: 'HNR-DOUBLEPCC',
        },
      ],
    },
  ]

  //

  const storeMenu = [
    {
      calories: 0,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_CustomBanner',

          imageURL:
            'https://lcemedia.littlecaesars.com/custompizza/CYO_RegLg.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 0,

      itemCaloriesText: '',

      itemDescription: '',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Create Your Own Pizza',

      itemName: 'Create Your Own Pizza',

      itemType: 'CUS',

      maxToppings: 0,

      menuItemCode: 'BNR-CUS',

      menuWarnings: null,

      orderable: true,

      price: 0,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2540,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/c64e3041-3ebb-4be6-862f-393bc04dd809.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/c64e3041-3ebb-4be6-862f-393bc04dd809.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101463,

      itemCaloriesText: '2540 Cal',

      itemDescription:
        '8 SLICES • LARGE | Pizza topped with 4 meats: Pepperoni, Bacon, Ham, and Italian Sausage with a buttery-tasting, calzone-like crust filled with mozzarella cheese and one of the meats from the center. Plus Crazy Sauce®',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: '4-Quarter Calzony (2540 Cal)',

      itemName: '4-Quarter Calzony',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-4QUARTERC',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 4220,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2fc6c087-7159-45e3-b769-100f661c7c2b.png',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2fc6c087-7159-45e3-b769-100f661c7c2b.png',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 602584,

      itemCaloriesText: '4220 Cal',

      itemDescription:
        '4-Quarter Calzony + Crazy Combo® + 2-liter PEPSI-COLA® Product.',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories:
        'NFL 4-Quarter Calzony Meal Deal with Pepsi® (4220 Cal)',

      itemName: 'NFL 4-Quarter Calzony Meal Deal with Pepsi®',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-4QCMDPEP',

      menuWarnings: null,

      orderable: true,

      price: 16.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices pizza, 8 breadsticks, 2-liters soda',

      bannerId: null,
    },

    {
      calories: 4330,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/697260ea-a61b-4b6c-a349-f5b9304c74b7.png',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/697260ea-a61b-4b6c-a349-f5b9304c74b7.png',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 602584,

      itemCaloriesText: '4330 Cal',

      itemDescription:
        '4-Quarter Calzony + Crazy Combo® + 2-liter PEPSI-COLA® Product.',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories:
        'NFL 4-Quarter Calzony Meal Deal with Mountain Dew® (4330 Cal)',

      itemName: 'NFL 4-Quarter Calzony Meal Deal with Mountain Dew®',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-4QCMDMTD',

      menuWarnings: null,

      orderable: true,

      price: 16.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices pizza, 8 breadsticks, 2-liters soda',

      bannerId: null,
    },

    {
      calories: 4220,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/9cdcdef1-54fa-4b1f-9ed8-5ca0d1cac3e7.png',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/9cdcdef1-54fa-4b1f-9ed8-5ca0d1cac3e7.png',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 602584,

      itemCaloriesText: '4220 Cal',

      itemDescription:
        '4-Quarter Calzony + Crazy Combo® + 2-liter PEPSI-COLA® Product.',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories:
        'NFL 4-Quarter Calzony Meal Deal with Starry® (4220 Cal)',

      itemName: 'NFL 4-Quarter Calzony Meal Deal with Starry®',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-4QCMDST',

      menuWarnings: null,

      orderable: true,

      price: 16.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices pizza, 8 breadsticks, 2-liters soda',

      bannerId: null,
    },

    {
      calories: 3370,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/853302eb-2888-48ef-a95c-7ad5c9b1251e.png',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/853302eb-2888-48ef-a95c-7ad5c9b1251e.png',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 602584,

      itemCaloriesText: '3370 Cal',

      itemDescription:
        '4-Quarter Calzony + Crazy Combo® + 2-liter PEPSI-COLA® Product.',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories:
        'NFL 4-Quarter Calzony Meal Deal with Diet Pepsi® (3370 Cal)',

      itemName: 'NFL 4-Quarter Calzony Meal Deal with Diet Pepsi®',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-4QCMDDP',

      menuWarnings: null,

      orderable: true,

      price: 16.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices pizza, 8 breadsticks, 2-liters soda',

      bannerId: null,
    },

    {
      calories: 2560,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/1a0d64d3-87f6-4867-8eec-750e3ca3106e.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/1a0d64d3-87f6-4867-8eec-750e3ca3106e.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101431,

      itemCaloriesText: '2560 Cal',

      itemDescription:
        'A large round pizza topped with barbeque sauce, Mozzarella cheese, smoky Ham and two different types of bacon: Smoked black pepper crumbled bacon and Applewood Smoked bacon strips',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'BBQ Bacon Blast (2560 Cal)',

      itemName: 'BBQ Bacon Blast',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-BACONBL',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2860,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4e29d834-e054-4ec5-9317-b6d1e6a033be.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4e29d834-e054-4ec5-9317-b6d1e6a033be.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101430,

      itemCaloriesText: '2860 Cal',

      itemDescription:
        'A large round pizza with Mozzarella Cheese, Pepperoni, Old World Pepperoni and toasted Parmesan & Asiago Cheese finished with our signature Garlic Parmesan Crazy Crust',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Double Pepperoni Crazy Crust (2860 Cal)',

      itemName: 'Double Pepperoni Crazy Crust',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-DOUBLEPCC',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2360,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bfd4f6b1-52bf-4710-a0fa-6947e804e3b4.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bfd4f6b1-52bf-4710-a0fa-6947e804e3b4.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101425,

      itemCaloriesText: '2360 Cal',

      itemDescription:
        'A large pizza divided into four sections (two slices per section): 1. Cheese 2. Pepperoni 3. Pepperoni, Italian Sausage & Bacon 4. Pepperoni, Italian Sausage, Mushrooms, Onions & Green Peppers',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'FOUR-N-ONE (2360 Cal)',

      itemName: 'FOUR-N-ONE',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-FOURNONE',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2400,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4e863426-b120-48a9-a4ee-33e04cc4a270.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4e863426-b120-48a9-a4ee-33e04cc4a270.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101279,

      itemCaloriesText: '2400 Cal',

      itemDescription:
        'Large pizza with White Sauce and Crispy Chicken pieces, topped with a swirl of Buffalo sauce.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Buffalo Crispy Chicken (2400 Cal)',

      itemName: 'Buffalo Crispy Chicken',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-BUFCCKP',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2560,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/72007bc5-00be-4725-a4b6-70b0be89d363.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/72007bc5-00be-4725-a4b6-70b0be89d363.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e8ce9cba-b22d-4df7-8d24-3f060c6ef65c.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e8ce9cba-b22d-4df7-8d24-3f060c6ef65c.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101277,

      itemCaloriesText: '2560 Cal',

      itemDescription:
        'Large pizza with White Sauce and Crispy Chicken pieces, topped with a swirl of Garlic Parm sauce.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Garlic Parm Crispy Chicken (2560 Cal)',

      itemName: 'Garlic Parm Crispy Chicken',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-GPC1',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2480,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b7bccc55-a544-41c1-87a1-e4a967ec32e5.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b7bccc55-a544-41c1-87a1-e4a967ec32e5.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101278,

      itemCaloriesText: '2480 Cal',

      itemDescription:
        'Large pizza with White Sauce and Crispy Chicken pieces, topped with a swirl of BBQ sauce.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'BBQ Crispy Chicken (2480 Cal)',

      itemName: 'BBQ Crispy Chicken',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-BBQCCKP',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2380,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e86f501a-3fa7-493c-a952-c12c710708f6.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e86f501a-3fa7-493c-a952-c12c710708f6.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101276,

      itemCaloriesText: '2380 Cal',

      itemDescription:
        'Large pizza with White Sauce and Crispy Chicken pieces.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Naked Crispy Chicken (2380 Cal)',

      itemName: 'Naked Crispy Chicken',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-NCCKP',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 3480,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4dde0c74-bbe2-4b54-9aad-86a58e149130.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4dde0c74-bbe2-4b54-9aad-86a58e149130.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/8d2612f4-891a-4772-a1bb-91758a0cf8cc.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/8d2612f4-891a-4772-a1bb-91758a0cf8cc.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201058,

      itemCaloriesText: '3480 Cal',

      itemDescription:
        '8-corner, large pizza featuring a crunchy crust with caramelized cheese edges and topped with Cheese, Pepperoni, and crispy Applewood Smoked Bacon, with a delicious Bacon-Wrapped crust.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Bacon-Wrapped Deep Dish (3480 Cal)',

      itemName: 'Bacon-Wrapped Deep Dish',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-BWDDD',

      menuWarnings: null,

      orderable: true,

      price: 13.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 200,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/c9e8a63a-b886-42e3-b67a-747ae59a8adf.png',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/c9e8a63a-b886-42e3-b67a-747ae59a8adf.png',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204361,

      itemCaloriesText: '200 Cal',

      itemDescription:
        'Introducing PEPSI® Pineapple, exclusively at Little Caesars! The classic Pepsi taste you love, made with a splash of pineapple juice. The perfect refreshment to enjoy during the heat of summer, available for a limited time only.\r\nAll beverage-related trademarks are owned by PepsiCo, Inc. or its affiliated companies. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'PEPSI® Pineapple 16 oz. (200 Cal)',

      itemName: 'PEPSI® Pineapple 16 oz.',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'CNR-16OZPPINE',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 4070,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bcaaa450-09eb-43c1-b375-4c86dd5b4b30.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bcaaa450-09eb-43c1-b375-4c86dd5b4b30.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201423,

      itemCaloriesText: '4070 Cal',

      itemDescription:
        'Large Deep Dish cut into twenty pieces with four sections topped with Cheese, Pepperoni, Applewood Smoked Bacon and Jalapeno, served with Crazy Sauce® and Hidden Valley® Ranch',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Deep Dish Dippers (4070 Cal)',

      itemName: 'Deep Dish Dippers',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-DD10DIPPERS',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '20 pieces',

      bannerId: null,
    },

    {
      calories: 1030,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/6c7927d0-0f90-46ac-9c9e-b38b0b3b0391.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/6c7927d0-0f90-46ac-9c9e-b38b0b3b0391.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101390,

      itemCaloriesText: '1030 Cal',

      itemDescription:
        'Four slices of a personal Gluten Free Pizza with Pepperoni and a crispy caramelized cheesy crust edge',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Gluten Free Pepperoni Pizza (1030 Cal)',

      itemName: 'Gluten Free Pepperoni Pizza',

      itemType: 'LTO',

      maxToppings: 0,

      menuItemCode: 'HNR-GLUTENFPEP',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '4 slices',

      bannerId: null,
    },

    {
      calories: 2560,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/1a0d64d3-87f6-4867-8eec-750e3ca3106e.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/1a0d64d3-87f6-4867-8eec-750e3ca3106e.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101431,

      itemCaloriesText: '2560 Cal',

      itemDescription:
        'A large round pizza topped with barbeque sauce, Mozzarella cheese, smoky Ham and two different types of bacon: Smoked black pepper crumbled bacon and Applewood Smoked bacon strips',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'BBQ Bacon Blast (2560 Cal)',

      itemName: 'BBQ Bacon Blast',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-BACONBL',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2860,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4e29d834-e054-4ec5-9317-b6d1e6a033be.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4e29d834-e054-4ec5-9317-b6d1e6a033be.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101430,

      itemCaloriesText: '2860 Cal',

      itemDescription:
        'A large round pizza with Mozzarella Cheese, Pepperoni, Old World Pepperoni and toasted Parmesan & Asiago Cheese finished with our signature Garlic Parmesan Crazy Crust',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Double Pepperoni Crazy Crust (2860 Cal)',

      itemName: 'Double Pepperoni Crazy Crust',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-DOUBLEPCC',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2360,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bfd4f6b1-52bf-4710-a0fa-6947e804e3b4.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bfd4f6b1-52bf-4710-a0fa-6947e804e3b4.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101425,

      itemCaloriesText: '2360 Cal',

      itemDescription:
        'A large pizza divided into four sections (two slices per section): 1. Cheese 2. Pepperoni 3. Pepperoni, Italian Sausage & Bacon 4. Pepperoni, Italian Sausage, Mushrooms, Onions & Green Peppers',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'FOUR-N-ONE (2360 Cal)',

      itemName: 'FOUR-N-ONE',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-FOURNONE',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2400,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4e863426-b120-48a9-a4ee-33e04cc4a270.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4e863426-b120-48a9-a4ee-33e04cc4a270.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101279,

      itemCaloriesText: '2400 Cal',

      itemDescription:
        'Large pizza with White Sauce and Crispy Chicken pieces, topped with a swirl of Buffalo sauce.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Buffalo Crispy Chicken (2400 Cal)',

      itemName: 'Buffalo Crispy Chicken',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-BUFCCKP',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2560,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/72007bc5-00be-4725-a4b6-70b0be89d363.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/72007bc5-00be-4725-a4b6-70b0be89d363.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e8ce9cba-b22d-4df7-8d24-3f060c6ef65c.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e8ce9cba-b22d-4df7-8d24-3f060c6ef65c.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101277,

      itemCaloriesText: '2560 Cal',

      itemDescription:
        'Large pizza with White Sauce and Crispy Chicken pieces, topped with a swirl of Garlic Parm sauce.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Garlic Parm Crispy Chicken (2560 Cal)',

      itemName: 'Garlic Parm Crispy Chicken',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-GPC1',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2480,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b7bccc55-a544-41c1-87a1-e4a967ec32e5.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b7bccc55-a544-41c1-87a1-e4a967ec32e5.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101278,

      itemCaloriesText: '2480 Cal',

      itemDescription:
        'Large pizza with White Sauce and Crispy Chicken pieces, topped with a swirl of BBQ sauce.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'BBQ Crispy Chicken (2480 Cal)',

      itemName: 'BBQ Crispy Chicken',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-BBQCCKP',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2380,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e86f501a-3fa7-493c-a952-c12c710708f6.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e86f501a-3fa7-493c-a952-c12c710708f6.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101276,

      itemCaloriesText: '2380 Cal',

      itemDescription:
        'Large pizza with White Sauce and Crispy Chicken pieces.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Naked Crispy Chicken (2380 Cal)',

      itemName: 'Naked Crispy Chicken',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-NCCKP',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2660,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/27073dbc-3a21-4241-837b-677faef0e042.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/27073dbc-3a21-4241-837b-677faef0e042.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201165,

      itemCaloriesText: '2660 Cal',

      itemDescription:
        'A large cheese-stuffed buttery-flavored soft pretzel crust with Creamy Cheddar Cheese Sauce, Mozzarella Cheese and Pepperoni.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories:
        'Stuffed Pretzel Crust with Cheese Sauce (2660 Cal)',

      itemName: 'Stuffed Pretzel Crust with Cheese Sauce',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-SCPP',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2080,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e51396cf-7cd8-4324-8240-437249ba688d.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e51396cf-7cd8-4324-8240-437249ba688d.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101281,

      itemCaloriesText: '2080 Cal',

      itemDescription:
        'A large buttery-flavored soft pretzel crust pizza with pizza sauce, Mozzarella Cheese and Pepperoni.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pretzel Crust with Pizza Sauce (2080 Cal)',

      itemName: 'Pretzel Crust with Pizza Sauce',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-SPCPS',

      menuWarnings: null,

      orderable: true,

      price: 10,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2560,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/27073dbc-3a21-4241-837b-677faef0e042.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/27073dbc-3a21-4241-837b-677faef0e042.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101282,

      itemCaloriesText: '2560 Cal',

      itemDescription:
        'A large cheese-stuffed buttery-flavored soft pretzel crust with pizza sauce, Mozzarella Cheese and Pepperoni.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Stuffed Pretzel Crust with Pizza Sauce (2560 Cal)',

      itemName: 'Stuffed Pretzel Crust with Pizza Sauce',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-SCPPS',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2190,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/90959163-0849-4db5-bc8c-ec3d79008602.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/90959163-0849-4db5-bc8c-ec3d79008602.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201064,

      itemCaloriesText: '2190 Cal',

      itemDescription:
        'A large buttery-flavored soft pretzel crust pizza with Creamy Cheddar Cheese Sauce, Mozzarella Cheese and Pepperoni.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pretzel Crust with Cheese Sauce (2190 Cal)',

      itemName: 'Pretzel Crust with Cheese Sauce',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-SPCP',

      menuWarnings: null,

      orderable: true,

      price: 10,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 1940,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/deeb3921-eb12-429d-a468-6324171e7694.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/deeb3921-eb12-429d-a468-6324171e7694.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101423,

      itemCaloriesText: '1940 Cal',

      itemDescription:
        'A large buttery-flavored soft pretzel crust pizza with Creamy Cheddar Cheese Sauce and topped with Mozzarella Cheese.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Cheese Pretzel Crust With Cheese Sauce (1940 Cal)',

      itemName: 'Cheese Pretzel Crust With Cheese Sauce',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-SCCHEESEPR',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 3020,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/3c6cc070-6ef2-4302-be3a-411560d8cfbb.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/3c6cc070-6ef2-4302-be3a-411560d8cfbb.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101378,

      itemCaloriesText: '3020 Cal',

      itemDescription:
        'A large Pepperoni pizza topped with over 100 crispy old world Pepperonis all the way to the edge and a crispy, caramelized crust.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Old World Fanceroni Pepperoni™ (3020 Cal)',

      itemName: 'Old World Fanceroni Pepperoni™',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-FANCPEP',

      menuWarnings: null,

      orderable: true,

      price: 10.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2300,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b99ded73-23db-4247-8f8b-55348deb9f6e.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b99ded73-23db-4247-8f8b-55348deb9f6e.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201342,

      itemCaloriesText: '2300 Cal',

      itemDescription:
        'Four slices of Pepperoni pizza combined with eight Italian Cheese Stix, plus Crazy Sauce®',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Slices-N-Stix® (2300 Cal)',

      itemName: 'Slices-N-Stix®',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-SNS',

      menuWarnings: null,

      orderable: true,

      price: 6.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2980,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/9828f71d-7c6f-479d-a523-77de6ff831c0.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/9828f71d-7c6f-479d-a523-77de6ff831c0.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101402,

      itemCaloriesText: '2980 Cal',

      itemDescription:
        'Four slices of Pepperoni pizza combined with eight Italian Cheese Stix topped with Bacon, plus Crazy Sauce®',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Slices-N-Stix® Bacon (2980 Cal)',

      itemName: 'Slices-N-Stix® Bacon',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-SNSBACON',

      menuWarnings: null,

      orderable: true,

      price: 7.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '4 slices, 8 breadsticks',

      bannerId: null,
    },

    {
      calories: 2330,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/1b12adce-d7bc-4798-863d-b1e2cea93701.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/1b12adce-d7bc-4798-863d-b1e2cea93701.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101403,

      itemCaloriesText: '2330 Cal',

      itemDescription:
        'Four slices of Pepperoni pizza combined with eight Italian Cheese Stix topped with Jalapeno, plus Crazy Sauce®',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Slices-N-Stix® Jalapeño (2330 Cal)',

      itemName: 'Slices-N-Stix® Jalapeño',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-SNSJAL',

      menuWarnings: null,

      orderable: true,

      price: 7.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '4 slices, 8 breadsticks',

      bannerId: null,
    },

    {
      calories: 2130,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/84cd47b2-767d-4d9d-bd90-2ea88caf535a.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/84cd47b2-767d-4d9d-bd90-2ea88caf535a.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201100,

      itemCaloriesText: '2130 Cal',

      itemDescription:
        'Large thin crust pizza topped right to the edge with Pepperoni and Cheese.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Thin Crust Pepperoni (2130 Cal)',

      itemName: 'Thin Crust Pepperoni',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-TPEP',

      menuWarnings: null,

      orderable: true,

      price: 6.49,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1980,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/766e5504-9b7a-4484-b9b2-07cadddfeced.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/766e5504-9b7a-4484-b9b2-07cadddfeced.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201108,

      itemCaloriesText: '1980 Cal',

      itemDescription:
        'Large thin crust pizza topped right to the edge with Cheese.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Thin Crust Cheese (1980 Cal)',

      itemName: 'Thin Crust Cheese',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-THINCHS',

      menuWarnings: null,

      orderable: true,

      price: 10,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2980,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/f472c86d-4cfc-47a9-8309-5a638d5408cf.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/f472c86d-4cfc-47a9-8309-5a638d5408cf.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201138,

      itemCaloriesText: '2980 Cal',

      itemDescription:
        'Large round pizza with more Pepperoni and Cheese than our Classic pizza, plus a ring of cheese baked into the crust.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Stuffed Crust Pepperoni (2980 Cal)',

      itemName: 'Stuffed Crust Pepperoni',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-SCPEP',

      menuWarnings: null,

      orderable: true,

      price: 9,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 3340,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bce6b83b-f0e8-4ed0-8f15-74fefcf5a961.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bce6b83b-f0e8-4ed0-8f15-74fefcf5a961.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101229,

      itemCaloriesText: '3340 Cal',

      itemDescription:
        'A large ExtraMostBestest® pepperoni pizza with pepperoni and cheese stuffed in a parmesan and butter flavored crust.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pepperoni & Cheese Stuffed Crust (3340 Cal)',

      itemName: 'Pepperoni & Cheese Stuffed Crust',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-PCSCPEP',

      menuWarnings: null,

      orderable: true,

      price: 10,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2830,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/9a2ceced-dc37-4f3e-8784-0f599386c5ea.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/9a2ceced-dc37-4f3e-8784-0f599386c5ea.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201150,

      itemCaloriesText: '2830 Cal',

      itemDescription:
        "CRAZY!CRAZY!™ AMOUNTS OF TOPPINGS AT THE NATION'S BEST PRICE** Large round pizza with Bacon, Italian Sausage, Smoky Ham, Pepperoni and Seasoned Beef",

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: '5 Meat Feast™ (2830 Cal)',

      itemName: '5 Meat Feast™',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-5MFP',

      menuWarnings: null,

      orderable: true,

      price: 15,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2500,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/11616129-ce29-450e-af39-8d543f05ab78.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/11616129-ce29-450e-af39-8d543f05ab78.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201004,

      itemCaloriesText: '2500 Cal',

      itemDescription:
        "CRAZY!CRAZY!™ AMOUNTS OF TOPPINGS AT THE NATION'S BEST PRICE** Large round pizza with Pepperoni, Italian Sausage, Mushrooms, Onions, and Green Peppers",

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Ultimate Supreme (2500 Cal)',

      itemName: 'Ultimate Supreme',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-USP',

      menuWarnings: null,

      orderable: true,

      price: 13,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2860,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4fc71413-5a82-4626-bba9-041d8c22435d.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4fc71413-5a82-4626-bba9-041d8c22435d.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201003,

      itemCaloriesText: '2860 Cal',

      itemDescription:
        'Large round pizza topped with Pepperoni, Italian Sausage and Bacon',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: '3 Meat Treat® (2860 Cal)',

      itemName: '3 Meat Treat®',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-3MT',

      menuWarnings: null,

      orderable: true,

      price: 12,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2180,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0c0fd91f-6243-4f8e-a212-b36d1d7254a5.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0c0fd91f-6243-4f8e-a212-b36d1d7254a5.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201002,

      itemCaloriesText: '2180 Cal',

      itemDescription:
        "CRAZY!CRAZY!™ AMOUNTS OF TOPPINGS AT THE NATION'S BEST PRICE** Large round pizza with Smoky Ham and Pineapple",

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Hula Hawaiian® (2180 Cal)',

      itemName: 'Hula Hawaiian®',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-HHP',

      menuWarnings: null,

      orderable: true,

      price: 10,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2240,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0576c88e-ece5-44c9-98ec-f943dbba59fa.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0576c88e-ece5-44c9-98ec-f943dbba59fa.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201008,

      itemCaloriesText: '2240 Cal',

      itemDescription:
        "CRAZY!CRAZY!™ AMOUNTS OF TOPPINGS AT THE NATION'S BEST PRICE** Large round pizza with Green Peppers, Onions, Mushrooms, Black Olives and Italian Seasoning",

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Veggie (2240 Cal)',

      itemName: 'Veggie',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-VEGP',

      menuWarnings: null,

      orderable: true,

      price: 10,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2220,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/16739b08-1026-43f3-9d36-7bee39cb6f74.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/16739b08-1026-43f3-9d36-7bee39cb6f74.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201128,

      itemCaloriesText: '2220 Cal',

      itemDescription:
        'Large round pizza with more Cheese than our Classic pizza.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'ExtraMostBestest® Cheese (2220 Cal)',

      itemName: 'ExtraMostBestest® Cheese',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-CHS',

      menuWarnings: null,

      orderable: true,

      price: 6.55,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2500,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/6cba601a-1e69-4acc-8368-c5e0a0397593.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/6cba601a-1e69-4acc-8368-c5e0a0397593.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201106,

      itemCaloriesText: '2500 Cal',

      itemDescription:
        'Large round pizza with more Pepperoni and Cheese than our Classic pizza.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'ExtraMostBestest® Pepperoni (2500 Cal)',

      itemName: 'ExtraMostBestest® Pepperoni',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-PEP',

      menuWarnings: null,

      orderable: true,

      price: 6.55,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2660,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/08b88686-89ba-4476-a9a4-0a1cb6c2b181.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/08b88686-89ba-4476-a9a4-0a1cb6c2b181.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201129,

      itemCaloriesText: '2660 Cal',

      itemDescription: 'Large round with Italian Sausage',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'ExtraMostBestest® Italian Sausage (2660 Cal)',

      itemName: 'ExtraMostBestest® Italian Sausage',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'EMB-SAU',

      menuWarnings: null,

      orderable: true,

      price: 6,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2270,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4f444c1c-e43e-45a7-a01e-58d29b7a753d.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4f444c1c-e43e-45a7-a01e-58d29b7a753d.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201001,

      itemCaloriesText: '2270 Cal',

      itemDescription: 'Large round pizza with Italian Sausage',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Classic Italian Sausage (2270 Cal)',

      itemName: 'Classic Italian Sausage',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-SAU',

      menuWarnings: null,

      orderable: true,

      price: 5.55,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2300,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/f6ffa365-9c1a-4b79-bfb7-3564e8e10d5e.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/f6ffa365-9c1a-4b79-bfb7-3564e8e10d5e.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101001,

      itemCaloriesText: '2300 Cal',

      itemDescription: 'Large round pizza with Pepperoni',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Classic Pepperoni (2300 Cal)',

      itemName: 'Classic Pepperoni',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-PEP',

      menuWarnings: null,

      orderable: true,

      price: 10,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1950,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/6d080097-dc8c-4812-a3aa-026a0ac45b5a.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/6d080097-dc8c-4812-a3aa-026a0ac45b5a.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101002,

      itemCaloriesText: '1950 Cal',

      itemDescription: 'Large round pizza with Cheese',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Classic Cheese (1950 Cal)',

      itemName: 'Classic Cheese',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-CHS',

      menuWarnings: null,

      orderable: true,

      price: 5,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2120,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/677a1e5b-3338-40ec-955f-1e68c2b73e53.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/677a1e5b-3338-40ec-955f-1e68c2b73e53.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101401,

      itemCaloriesText: '2120 Cal',

      itemDescription: 'Large round pizza with half pepperoni and half cheese',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Half Pepperoni, Half Cheese Pizza (2120 Cal)',

      itemName: 'Half Pepperoni, Half Cheese Pizza',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-HALFPEPCH',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2190,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/06a1d10c-0ea7-4a57-9198-3bb7d2bb1fb2.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/06a1d10c-0ea7-4a57-9198-3bb7d2bb1fb2.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201017,

      itemCaloriesText: '2190 Cal',

      itemDescription: 'Large round pizza with beef',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Classic Beef Pizza (2190 Cal)',

      itemName: 'Classic Beef Pizza',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-CLSBEEF',

      menuWarnings: null,

      orderable: true,

      price: 5.55,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 2380,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bdfe64dd-4b4d-43e0-97f6-1f62b29dd76d.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bdfe64dd-4b4d-43e0-97f6-1f62b29dd76d.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 202011,

      itemCaloriesText: '2380 Cal',

      itemDescription: 'Large round pizza with pepperoni and jalapeños',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pepperoni & Jalapeño (2380 Cal)',

      itemName: 'Pepperoni & Jalapeño',

      itemType: 'LRP',

      maxToppings: 0,

      menuItemCode: 'HNR-PJALP',

      menuWarnings: null,

      orderable: true,

      price: 7.75,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 3480,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4dde0c74-bbe2-4b54-9aad-86a58e149130.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4dde0c74-bbe2-4b54-9aad-86a58e149130.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/8d2612f4-891a-4772-a1bb-91758a0cf8cc.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/8d2612f4-891a-4772-a1bb-91758a0cf8cc.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201058,

      itemCaloriesText: '3480 Cal',

      itemDescription:
        '8-corner, large pizza featuring a crunchy crust with caramelized cheese edges and topped with Cheese, Pepperoni, and crispy Applewood Smoked Bacon, with a delicious Bacon-Wrapped crust.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Bacon-Wrapped Deep Dish (3480 Cal)',

      itemName: 'Bacon-Wrapped Deep Dish',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-BWDDD',

      menuWarnings: null,

      orderable: true,

      price: 13.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '8 slices',

      bannerId: null,
    },

    {
      calories: 4070,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bcaaa450-09eb-43c1-b375-4c86dd5b4b30.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/bcaaa450-09eb-43c1-b375-4c86dd5b4b30.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201423,

      itemCaloriesText: '4070 Cal',

      itemDescription:
        'Large Deep Dish cut into twenty pieces with four sections topped with Cheese, Pepperoni, Applewood Smoked Bacon and Jalapeno, served with Crazy Sauce® and Hidden Valley® Ranch',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Deep Dish Dippers (4070 Cal)',

      itemName: 'Deep Dish Dippers',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-DD10DIPPERS',

      menuWarnings: null,

      orderable: true,

      price: 9.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '20 pieces',

      bannerId: null,
    },

    {
      calories: 3050,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/a2bafbc4-6b0d-4d3d-8327-cac4731e0694.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/a2bafbc4-6b0d-4d3d-8327-cac4731e0694.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 402208,

      itemCaloriesText: '3050 Cal',

      itemDescription:
        'Large Detroit-Style Deep Dish Pizza with Pepperoni, Italian Sausage, Mushrooms, Onions and Green Peppers',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories:
        'Detroit-Style Deep Dish Ultimate Supreme (3050 Cal)',

      itemName: 'Detroit-Style Deep Dish Ultimate Supreme',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-DDDUSP',

      menuWarnings: null,

      orderable: true,

      price: 11,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2730,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2af32bde-1f94-4b8a-86fc-506005937bea.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2af32bde-1f94-4b8a-86fc-506005937bea.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201045,

      itemCaloriesText: '2730 Cal',

      itemDescription:
        'Large Detroit-Style Deep Dish Pizza with Green Peppers, Onions, Mushrooms and Black Olives',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Detroit-Style Deep Dish Veggie (2730 Cal)',

      itemName: 'Detroit-Style Deep Dish Veggie',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-DDDVEGP',

      menuWarnings: null,

      orderable: true,

      price: 11,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 3480,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/42aa14af-e837-4fba-8b51-c3129d6b7bbf.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/42aa14af-e837-4fba-8b51-c3129d6b7bbf.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201059,

      itemCaloriesText: '3480 Cal',

      itemDescription:
        'Large Detroit-Style Deep Dish Pizza with Pepperoni, Italian Sausage and Bacon',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Detroit-Style Deep Dish 3 Meat Treat® (3480 Cal)',

      itemName: 'Detroit-Style Deep Dish 3 Meat Treat®',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-DDD3MT',

      menuWarnings: null,

      orderable: true,

      price: 11,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2690,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/fa8c7f54-db78-4f10-8581-7631e9653969.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/fa8c7f54-db78-4f10-8581-7631e9653969.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 202204,

      itemCaloriesText: '2690 Cal',

      itemDescription:
        'Large Detroit-Style Deep Dish Pizza with Smoky Ham and Pineapple',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Detroit-Style Deep Dish Hula Hawaiian® (2690 Cal)',

      itemName: 'Detroit-Style Deep Dish Hula Hawaiian®',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-DDDHHP',

      menuWarnings: null,

      orderable: true,

      price: 10,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2770,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0259af00-9a7f-40c3-8622-b46bf27d85be.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0259af00-9a7f-40c3-8622-b46bf27d85be.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201042,

      itemCaloriesText: '2770 Cal',

      itemDescription: 'Large Detroit-Style Deep Dish Pizza with Pepperoni',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Detroit-Style Deep Dish Pepperoni (2770 Cal)',

      itemName: 'Detroit-Style Deep Dish Pepperoni',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-DDSP',

      menuWarnings: null,

      orderable: true,

      price: 8,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2820,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/3eb3d4fe-b700-430e-94f6-50b4ce31c7fd.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/3eb3d4fe-b700-430e-94f6-50b4ce31c7fd.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201044,

      itemCaloriesText: '2820 Cal',

      itemDescription:
        'Large Detroit-Style Deep Dish Pizza with Italian Sausage',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Detroit-Style Deep Dish Sausage (2820 Cal)',

      itemName: 'Detroit-Style Deep Dish Sausage',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-DDIS',

      menuWarnings: null,

      orderable: true,

      price: 8,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 2500,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/8becca0e-7a69-4caa-86cf-ea757116f448.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/8becca0e-7a69-4caa-86cf-ea757116f448.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 201043,

      itemCaloriesText: '2500 Cal',

      itemDescription: 'Large Detroit-Style Deep Dish Pizza with Cheese',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Detroit-Style Deep Dish Cheese (2500 Cal)',

      itemName: 'Detroit-Style Deep Dish Cheese',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-DDCH',

      menuWarnings: null,

      orderable: true,

      price: 10.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1590,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/53355f51-1d90-4063-a935-bac878615717.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/53355f51-1d90-4063-a935-bac878615717.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 601832,

      itemCaloriesText: '1590 Cal',

      itemDescription:
        'Four slices of Detroit-Style Deep Dish Pizza with Pepperoni and one 16 oz. PEPSI® Pineapple product. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Lunch Combo PEPSI® Pineapple (1590 Cal)',

      itemName: 'Lunch Combo PEPSI® Pineapple',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-PPLC',

      menuWarnings: [
        {
          id: 'Sodium',

          name: 'Sodium',

          url: 'https://mobilestatic-test.littlecaesars.com/menuwarningimages/NYC-sodium-warning-label-lg.jpg',

          altText: 'High Sodium',

          displayOrder: 0,

          warningText:
            'Warning indicates that the sodium (salt) content of this item is higher than the total daily recommended limit (2,300 mg). High sodium intake can increase blood pressure and risk of heart disease and stroke',
        },
      ],

      orderable: true,

      price: 5.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '(4) slices of pizza, (1) 16 oz. PEPSI® Pineapple',

      bannerId: null,
    },

    {
      calories: 1640,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/df0c4608-79a3-4599-80b1-1f454958f164.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/df0c4608-79a3-4599-80b1-1f454958f164.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 601001,

      itemCaloriesText: '1640 Cal',

      itemDescription:
        'Four slices of Detroit-Style Deep Dish Pizza with Pepperoni and one  20 oz. PEPSI-COLA® product.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Lunch Combo Pepsi® (1640 Cal)',

      itemName: 'Lunch Combo Pepsi®',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-SSLP',

      menuWarnings: [
        {
          id: 'Sodium',

          name: 'Sodium',

          url: 'https://mobilestatic-test.littlecaesars.com/menuwarningimages/NYC-sodium-warning-label-lg.jpg',

          altText: 'High Sodium',

          displayOrder: 0,

          warningText:
            'Warning indicates that the sodium (salt) content of this item is higher than the total daily recommended limit (2,300 mg). High sodium intake can increase blood pressure and risk of heart disease and stroke',
        },
      ],

      orderable: true,

      price: 5.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1680,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e95c4650-1cac-4bb9-ae4a-734a372c5178.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/e95c4650-1cac-4bb9-ae4a-734a372c5178.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 601001,

      itemCaloriesText: '1680 Cal',

      itemDescription:
        'Four slices of Detroit-Style Deep Dish Pizza with Pepperoni and one  20 oz. PEPSI-COLA® product.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Lunch Combo Mountain Dew® (1680 Cal)',

      itemName: 'Lunch Combo Mountain Dew®',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-SSLMDEW',

      menuWarnings: [
        {
          id: 'Sodium',

          name: 'Sodium',

          url: 'https://mobilestatic-test.littlecaesars.com/menuwarningimages/NYC-sodium-warning-label-lg.jpg',

          altText: 'High Sodium',

          displayOrder: 0,

          warningText:
            'Warning indicates that the sodium (salt) content of this item is higher than the total daily recommended limit (2,300 mg). High sodium intake can increase blood pressure and risk of heart disease and stroke',
        },
      ],

      orderable: true,

      price: 5.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1390,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/a1bfe99e-f8c5-4132-8ecb-fe1693455a03.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/a1bfe99e-f8c5-4132-8ecb-fe1693455a03.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 601001,

      itemCaloriesText: '1390 Cal',

      itemDescription:
        'Four slices of Detroit-Style Deep Dish Pizza with Pepperoni and one  20 oz. PEPSI-COLA® product.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Lunch Combo Diet Pepsi® (1390 Cal)',

      itemName: 'Lunch Combo Diet Pepsi®',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-SSLDP',

      menuWarnings: [
        {
          id: 'Sodium',

          name: 'Sodium',

          url: 'https://mobilestatic-test.littlecaesars.com/menuwarningimages/NYC-sodium-warning-label-lg.jpg',

          altText: 'High Sodium',

          displayOrder: 0,

          warningText:
            'Warning indicates that the sodium (salt) content of this item is higher than the total daily recommended limit (2,300 mg). High sodium intake can increase blood pressure and risk of heart disease and stroke',
        },
      ],

      orderable: true,

      price: 5.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1630,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/be8be67a-c6e6-422b-a8fd-ea7672633530.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/be8be67a-c6e6-422b-a8fd-ea7672633530.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 601001,

      itemCaloriesText: '1630 Cal',

      itemDescription:
        'Four slices of Detroit-Style Deep Dish Pizza with Pepperoni and one 20 oz. PEPSI-COLA® product.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Lunch Combo Starry® (1630 Cal)',

      itemName: 'Lunch Combo Starry®',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-SSLCSTR',

      menuWarnings: null,

      orderable: true,

      price: 5.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1390,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: '',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2b249170-1f0f-4374-bb11-391268191f21.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2b249170-1f0f-4374-bb11-391268191f21.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 601030,

      itemCaloriesText: '1390 Cal',

      itemDescription:
        'Four slices of Detroit-Style Deep Dish Pizza with Pepperoni and one  20 oz. PEPSI-COLA® product.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Lunch Combo Aquafina® (1390 Cal)',

      itemName: 'Lunch Combo Aquafina®',

      itemType: 'DDD',

      maxToppings: 0,

      menuItemCode: 'HNR-SSLAQ',

      menuWarnings: [
        {
          id: 'Sodium',

          name: 'Sodium',

          url: 'https://mobilestatic-test.littlecaesars.com/menuwarningimages/NYC-sodium-warning-label-lg.jpg',

          altText: 'High Sodium',

          displayOrder: 0,

          warningText:
            'Warning indicates that the sodium (salt) content of this item is higher than the total daily recommended limit (2,300 mg). High sodium intake can increase blood pressure and risk of heart disease and stroke',
        },
      ],

      orderable: true,

      price: 7,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1030,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Pizza',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/6c7927d0-0f90-46ac-9c9e-b38b0b3b0391.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/6c7927d0-0f90-46ac-9c9e-b38b0b3b0391.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101390,

      itemCaloriesText: '1030 Cal',

      itemDescription:
        'Four slices of a personal Gluten Free Pizza with Pepperoni and a crispy caramelized cheesy crust edge',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Gluten Free Pepperoni Pizza (1030 Cal)',

      itemName: 'Gluten Free Pepperoni Pizza',

      itemType: 'GFP',

      maxToppings: 0,

      menuItemCode: 'HNR-GLUTENFPEP',

      menuWarnings: null,

      orderable: true,

      price: 8.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '4 slices',

      bannerId: null,
    },

    {
      calories: 365,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/ac0bb23f-8394-4363-919c-47ea9d481ecc.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/ac0bb23f-8394-4363-919c-47ea9d481ecc.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 206139,

      itemCaloriesText: '365 Cal',

      itemDescription: 'Hidden Valley® Ranch dipping sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Hidden Valley® Ranch (365 Cal)',

      itemName: 'Hidden Valley® Ranch',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'SIDE-HDVARAN',

      menuWarnings: null,

      orderable: true,

      price: 1.25,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 800,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/7b9fbe8c-c32c-465d-9eb5-8ff8f902f395.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/7b9fbe8c-c32c-465d-9eb5-8ff8f902f395.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 103001,

      itemCaloriesText: '800 Cal',

      itemDescription:
        'Eight buttery garlic flavored bread sticks, sprinkled with parmesan cheese',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Crazy Bread® (800 Cal)',

      itemName: 'Crazy Bread®',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-CRZB',

      menuWarnings: null,

      orderable: true,

      price: 3.5,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 30,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/ae8dad2f-b27a-4a34-8b17-917f2563add7.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/ae8dad2f-b27a-4a34-8b17-917f2563add7.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 103002,

      itemCaloriesText: '30 Cal',

      itemDescription:
        'Tomato dipping sauce with a special blend of tasty herbs and spices',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Crazy Sauce® (30 Cal)',

      itemName: 'Crazy Sauce®',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-CRZS',

      menuWarnings: null,

      orderable: true,

      price: 1.49,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 800,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/af776edf-fb04-48ae-b1a8-9be6cac14a76.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/af776edf-fb04-48ae-b1a8-9be6cac14a76.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101289,

      itemCaloriesText: '800 Cal',

      itemDescription:
        'Brownie topped with Cookie Dough Frosting and TWIX® Cookie Bar Pieces | 4-piece order',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories:
        'Cookie Dough Brownie made with TWIX® Cookie Bar Pieces (800 Cal)',

      itemName: 'Cookie Dough Brownie made with TWIX® Cookie Bar Pieces',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-KDBTWX',

      menuWarnings: null,

      orderable: true,

      price: 3.89,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 840,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/c3a9608c-8966-45ed-b310-9c48d7e47dea.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/c3a9608c-8966-45ed-b310-9c48d7e47dea.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 101288,

      itemCaloriesText: '840 Cal',

      itemDescription:
        'Brownie topped with Cookie Dough Frosting and M&M’S® MINIS Chocolate Candies | 4-piece order',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories:
        'Cookie Dough Brownie made with M&M’S® MINIS Chocolate Candies (840 Cal)',

      itemName: 'Cookie Dough Brownie made with M&M’S® MINIS Chocolate Candies',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-CDBMM',

      menuWarnings: null,

      orderable: true,

      price: 3.89,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1820,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/a8d5cb4d-88f7-44ed-bb91-412e96b14af1.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/a8d5cb4d-88f7-44ed-bb91-412e96b14af1.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 203028,

      itemCaloriesText: '1820 Cal',

      itemDescription:
        'A family size version of our Crazy Bites tossed in cinnamon and sugar, then covered in a cinnamon roll topping and cream cheese icing',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Cinnamon Crazy Bites™ (1820 Cal)',

      itemName: 'Cinnamon Crazy Bites™',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-LCBCF',

      menuWarnings: null,

      orderable: true,

      price: 5,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1520,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0ffd2dad-f443-4190-9b96-43e8b1efec48.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0ffd2dad-f443-4190-9b96-43e8b1efec48.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 203004,

      itemCaloriesText: '1520 Cal',

      itemDescription:
        'Ten pieces of freshly baked bread with crispy edge, covered with cheese, pepperoni and sprinkled with parmesan cheese',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pepperoni Cheese Bread (1520 Cal)',

      itemName: 'Pepperoni Cheese Bread',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-10PCB',

      menuWarnings: null,

      orderable: true,

      price: 5,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 1340,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2b315d06-86ac-4221-a972-ada2ab77b20c.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2b315d06-86ac-4221-a972-ada2ab77b20c.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 103003,

      itemCaloriesText: '1340 Cal',

      itemDescription:
        'Ten pieces of freshly baked bread with a crispy edge, covered with cheese and topped with Italian spices',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Italian Cheese Bread (1340 Cal)',

      itemName: 'Italian Cheese Bread',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-ICB',

      menuWarnings: null,

      orderable: true,

      price: 5,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 510,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/3e96a238-f8b5-4fa5-9645-2e05bd2b35db.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/3e96a238-f8b5-4fa5-9645-2e05bd2b35db.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 105001,

      itemCaloriesText: '510 Cal',

      itemDescription: 'Traditionally seasoned oven roasted wings',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Caesar Wings® – Oven Roasted (510 Cal)',

      itemName: 'Caesar Wings® – Oven Roasted',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-ORCW',

      menuWarnings: null,

      orderable: true,

      price: 8.49,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 620,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/75ef9d13-6206-43db-9dcc-1546aac57ba2.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/75ef9d13-6206-43db-9dcc-1546aac57ba2.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 105001,

      itemCaloriesText: '620 Cal',

      itemDescription: 'Oven roasted wings with a sweet traditional BBQ sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Caesar Wings® – BBQ (620 Cal)',

      itemName: 'Caesar Wings® – BBQ',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-BBQCW',

      menuWarnings: null,

      orderable: true,

      price: 8.49,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 520,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/72bcd6cf-d309-4e8e-9ff4-6b2ca3f0c348.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/72bcd6cf-d309-4e8e-9ff4-6b2ca3f0c348.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 105001,

      itemCaloriesText: '520 Cal',

      itemDescription: 'Oven roasted wings with a hot Buffalo wing sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Caesar Wings® – Buffalo (520 Cal)',

      itemName: 'Caesar Wings® – Buffalo',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-BUFCW',

      menuWarnings: null,

      orderable: true,

      price: 8.49,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 670,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/f4770383-b2a2-4e5e-8ad3-9a5ba2c7fdec.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/f4770383-b2a2-4e5e-8ad3-9a5ba2c7fdec.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 105001,

      itemCaloriesText: '670 Cal',

      itemDescription: 'Oven roasted wings with a creamy Garlic Parmesan sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Caesar Wings® – Garlic Parmesan (670 Cal)',

      itemName: 'Caesar Wings® – Garlic Parmesan',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'HNRS-GPCW',

      menuWarnings: null,

      orderable: true,

      price: 8.49,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 370,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/73b2faeb-0fa2-4f0c-ba79-a9f55efd9942.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/73b2faeb-0fa2-4f0c-ba79-a9f55efd9942.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 206103,

      itemCaloriesText: '370 Cal',

      itemDescription: 'Butter and garlic flavored dipping sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Caesar Dips® - Butter Garlic Flavor (370 Cal)',

      itemName: 'Caesar Dips® - Butter Garlic Flavor',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'SIDE-BGCD',

      menuWarnings: null,

      orderable: true,

      price: 0.59,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 230,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2910186f-52af-48fe-9117-e5da63e047b3.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2910186f-52af-48fe-9117-e5da63e047b3.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 206101,

      itemCaloriesText: '230 Cal',

      itemDescription: 'Flavorful Buffalo ranch dipping sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Caesar Dips® - Buffalo Ranch (230 Cal)',

      itemName: 'Caesar Dips® - Buffalo Ranch',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'SIDE-BUFRCD',

      menuWarnings: null,

      orderable: true,

      price: 1.83,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 210,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0d6532da-1380-4a81-8cf6-dcab53c4340d.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0d6532da-1380-4a81-8cf6-dcab53c4340d.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 206108,

      itemCaloriesText: '210 Cal',

      itemDescription: 'Flavorful cheesy-jalapeño dipping sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Caesar Dips® - Cheezy Jalapeño (210 Cal)',

      itemName: 'Caesar Dips® - Cheezy Jalapeño',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'SIDE-CJCD',

      menuWarnings: null,

      orderable: true,

      price: 0.59,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 230,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/08577f65-f90e-4223-b91d-c4d49a0922b6.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/08577f65-f90e-4223-b91d-c4d49a0922b6.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 206104,

      itemCaloriesText: '230 Cal',

      itemDescription: 'Flavorful ranch dipping sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Caesar Dips® - Ranch (230 Cal)',

      itemName: 'Caesar Dips® - Ranch',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'SIDE-RCD',

      menuWarnings: null,

      orderable: true,

      price: 0.59,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 90,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Side',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2aa73332-6f94-4381-b7b6-15a93bf99877.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/2aa73332-6f94-4381-b7b6-15a93bf99877.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 206128,

      itemCaloriesText: '90 Cal',

      itemDescription: 'Flavorful Cheddar Cheese dipping sauce',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Cheddar Cheese Sauce (90 Cal)',

      itemName: 'Cheddar Cheese Sauce',

      itemType: 'HNRS',

      maxToppings: 0,

      menuItemCode: 'SIDE-CCDPP',

      menuWarnings: null,

      orderable: true,

      price: 1.29,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 200,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/c9e8a63a-b886-42e3-b67a-747ae59a8adf.png',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/c9e8a63a-b886-42e3-b67a-747ae59a8adf.png',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204361,

      itemCaloriesText: '200 Cal',

      itemDescription:
        'Introducing PEPSI® Pineapple, exclusively at Little Caesars! The classic Pepsi taste you love, made with a splash of pineapple juice. The perfect refreshment to enjoy during the heat of summer, available for a limited time only.\r\nAll beverage-related trademarks are owned by PepsiCo, Inc. or its affiliated companies. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'PEPSI® Pineapple 16 oz. (200 Cal)',

      itemName: 'PEPSI® Pineapple 16 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-16OZPPINE',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 850,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/04a0fbfc-8d6e-4a9f-ae6e-16ca8a04d5be.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/04a0fbfc-8d6e-4a9f-ae6e-16ca8a04d5be.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '850 Cal',

      itemDescription:
        '2-liter bottles of PEPSI®, DIET PEPSI®, MOUNTAIN DEW®, SIERRA MIST®, PEPSI WILD CHERRY® & BRISK®.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pepsi® 2 Liter (850 Cal)',

      itemName: 'Pepsi® 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LPEP',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 960,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/fdff0c18-2290-4977-bcb5-6784121bc7ce.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/fdff0c18-2290-4977-bcb5-6784121bc7ce.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '960 Cal',

      itemDescription:
        '2-liter bottles of PEPSI®, DIET PEPSI®, MOUNTAIN DEW®, SIERRA MIST®, PEPSI WILD CHERRY® & BRISK®.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Mountain Dew® 2 Liter (960 Cal)',

      itemName: 'Mountain Dew® 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LMDEW',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 900,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/7501c8d6-e922-4cde-8f39-550396cc9901.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/7501c8d6-e922-4cde-8f39-550396cc9901.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '900 Cal',

      itemDescription: '2-liter bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Starry® 2 Liter (900 Cal)',

      itemName: 'Starry® 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LSTARRY',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: 'NULL',

      bannerId: null,
    },

    {
      calories: 0,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/31a00fa2-13d4-42c1-902a-f301cad95741.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/31a00fa2-13d4-42c1-902a-f301cad95741.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '',

      itemDescription:
        '2-liter bottles of PEPSI®, DIET PEPSI®, MOUNTAIN DEW®, SIERRA MIST®, PEPSI WILD CHERRY® & BRISK®.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Diet Pepsi® 2 Liter',

      itemName: 'Diet Pepsi® 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LDPEP',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 850,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/794ac3b9-957f-4a23-a2ef-78f99b96e291.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/794ac3b9-957f-4a23-a2ef-78f99b96e291.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '850 Cal',

      itemDescription: '2-liter bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pepsi® Wild Cherry 2 Liter (850 Cal)',

      itemName: 'Pepsi® Wild Cherry 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LCHRPEP',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 350,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4c61e7aa-d7db-4175-99a5-68905eaa3162.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4c61e7aa-d7db-4175-99a5-68905eaa3162.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '350 Cal',

      itemDescription: '2-liter bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Lipton Brisk® with Lemon 2 Liter (350 Cal)',

      itemName: 'Lipton Brisk® with Lemon 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LLEMONTEA',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 850,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/5e9d6e1f-3826-4641-9365-d5fb9860b997.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/5e9d6e1f-3826-4641-9365-d5fb9860b997.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '850 Cal',

      itemDescription: '2-liter bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Mug® Root Beer 2 Liter (850 Cal)',

      itemName: 'Mug® Root Beer 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LROOTB',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 650,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/30b56ee2-8e63-49df-a923-1c765958a927.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/30b56ee2-8e63-49df-a923-1c765958a927.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '650 Cal',

      itemDescription: '2-liter bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Manzanita Sol® 2 Liter (650 Cal)',

      itemName: 'Manzanita Sol® 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LMANSOL',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 915,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/53d79e2c-d4c3-4b8e-8dd4-a52497b484ae.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/53d79e2c-d4c3-4b8e-8dd4-a52497b484ae.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204200,

      itemCaloriesText: '915 Cal',

      itemDescription:
        '2-liter bottles of PEPSI®, DIET PEPSI®, MOUNTAIN DEW®, SIERRA MIST®, PEPSI WILD CHERRY® & BRISK®. All beverage-related trademarks are owned by PepsiCo, Inc. or its affiliated companies. BRISK is a registered trademark of the Unilever Group of Companies.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Orange Crush® 2 Liter (915 Cal)',

      itemName: 'Orange Crush® 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LOCRUSH',

      menuWarnings: null,

      orderable: true,

      price: 2.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 600,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4ed67ecd-df65-4b33-a9b5-0c71fe1bca50.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/4ed67ecd-df65-4b33-a9b5-0c71fe1bca50.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204234,

      itemCaloriesText: '600 Cal',

      itemDescription: '2-liter bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Dole® Lemonade 2 Liter (600 Cal)',

      itemName: 'Dole® Lemonade 2 Liter',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-2LLEMON',

      menuWarnings: null,

      orderable: true,

      price: 2.28,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 250,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/55dcb7a5-2970-41dd-bd36-7fe0fb4c860c.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/55dcb7a5-2970-41dd-bd36-7fe0fb4c860c.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204100,

      itemCaloriesText: '250 Cal',

      itemDescription:
        '20 oz. bottles of PEPSI®, DIET PEPSI®, MOUNTAIN DEW®, SIERRA MIST®, PEPSI WILD CHERRY® & BRISK®.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pepsi® 20 oz. (250 Cal)',

      itemName: 'Pepsi® 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZPEP',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 290,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/9be63a26-2e20-43f2-9820-d122cd9e2446.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/9be63a26-2e20-43f2-9820-d122cd9e2446.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204100,

      itemCaloriesText: '290 Cal',

      itemDescription:
        '20 oz. bottles of PEPSI®, DIET PEPSI®, MOUNTAIN DEW®, SIERRA MIST®, PEPSI WILD CHERRY® & BRISK®.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Mountain Dew® 20 oz. (290 Cal)',

      itemName: 'Mountain Dew® 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZMDEW',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 240,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/fa3209e5-889e-4aad-a866-f70b79f77eaa.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/fa3209e5-889e-4aad-a866-f70b79f77eaa.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204100,

      itemCaloriesText: '240 Cal',

      itemDescription: '20 oz. bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Starry® 20 oz. (240 Cal)',

      itemName: 'Starry® 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZSTARRY',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: 'NULL',

      bannerId: null,
    },

    {
      calories: 0,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/5cd44ef6-fe2e-407e-85c2-c8e8a3ac3cf7.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/5cd44ef6-fe2e-407e-85c2-c8e8a3ac3cf7.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204100,

      itemCaloriesText: '',

      itemDescription:
        '20 oz. bottles of PEPSI®, DIET PEPSI®, MOUNTAIN DEW®, SIERRA MIST®, PEPSI WILD CHERRY® & BRISK®.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Diet Pepsi® 20 oz.',

      itemName: 'Diet Pepsi® 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZDPEP',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 260,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/de2c8b26-c932-4939-8f40-2aa77c5778a7.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/de2c8b26-c932-4939-8f40-2aa77c5778a7.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204100,

      itemCaloriesText: '260 Cal',

      itemDescription: '20 oz. bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Pepsi® Wild Cherry 20 oz. (260 Cal)',

      itemName: 'Pepsi® Wild Cherry 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZCHRPEP',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 260,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b47e32bc-66db-48ee-9927-2a8c849da6e8.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b47e32bc-66db-48ee-9927-2a8c849da6e8.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204100,

      itemCaloriesText: '260 Cal',

      itemDescription: '20 oz. bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Mug® Root Beer 20 oz. (260 Cal)',

      itemName: 'Mug® Root Beer 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZROOTB',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 200,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/3e3e6f94-4469-47eb-b58d-f47ea0bf7d93.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/3e3e6f94-4469-47eb-b58d-f47ea0bf7d93.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204100,

      itemCaloriesText: '200 Cal',

      itemDescription: '20 oz. bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Manzanita Sol® 20 oz. (200 Cal)',

      itemName: 'Manzanita Sol® 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZMANSOL',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 270,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b4a0632d-cbae-4952-b097-68a32c70ca68.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/b4a0632d-cbae-4952-b097-68a32c70ca68.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204100,

      itemCaloriesText: '270 Cal',

      itemDescription:
        '20 oz. bottles of PEPSI®, DIET PEPSI®, MOUNTAIN DEW®, SIERRA MIST®, PEPSI WILD CHERRY® & BRISK®. All beverage-related trademarks are owned by PepsiCo, Inc. or its affiliated companies. BRISK is a registered trademark of the Unilever Group of Companies.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Orange Crush® 20 oz. (270 Cal)',

      itemName: 'Orange Crush® 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZOCRUSH',

      menuWarnings: null,

      orderable: true,

      price: 1.79,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 110,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/7558a66e-26a9-4898-853b-101037629037.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/7558a66e-26a9-4898-853b-101037629037.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204138,

      itemCaloriesText: '110 Cal',

      itemDescription: '20 oz. bottles of PEPSI®-Cola products.*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Dole® Lemonade 20 oz. (110 Cal)',

      itemName: 'Dole® Lemonade 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-20OZLEMON',

      menuWarnings: null,

      orderable: true,

      price: 1.59,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 0,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/37abc18e-f7ea-425a-b7c9-7cf8d0866974.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/37abc18e-f7ea-425a-b7c9-7cf8d0866974.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204301,

      itemCaloriesText: '',

      itemDescription: '20 oz. AQUAFINA®*',

      additionalDescription:
        'All trademarks are the property of their respective owners. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'AQUAFINA® 20 oz.',

      itemName: 'AQUAFINA® 20 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-AQ20OZ',

      menuWarnings: null,

      orderable: true,

      price: 1.99,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },

    {
      calories: 270,

      caloriesRange: '',

      comment: '',

      crustImages: null,

      favoriteId: 0,

      favoriteName: null,

      foodGroup: 'Drink',

      id: 0,

      images: [
        {
          imageAltText: '',

          imageType: 'Web_ItemDetailImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0d48b4a8-13d3-4108-b877-508092411c5c.jpg',

          deepLinkURL: '',
        },

        {
          imageAltText: '',

          imageType: 'Web_MenuImage',

          imageURL:
            'https://mobilestatic-test.littlecaesars.com/weborderingimages/0d48b4a8-13d3-4108-b877-508092411c5c.jpg',

          deepLinkURL: '',
        },
      ],

      isCustomMenuItem: false,

      itemId: 204309,

      itemCaloriesText: '270 Cal',

      itemDescription:
        '16 oz. Rockstar Energy®. All beverage-related trademarks are owned by PepsiCo, Inc. or its affiliated companies. For PEPSI-COLA® nutrition information, please visit https://www.pepsicobeveragefacts.com/home/find#/.',

      additionalDescription: '',

      itemDescriptionWithCalories: null,

      itemNameWithCalories: 'Rockstar Energy® 16 oz. (270 Cal)',

      itemName: 'Rockstar Energy® 16 oz.',

      itemType: 'CNR',

      maxToppings: 0,

      menuItemCode: 'CNR-16OZROCKS',

      menuWarnings: null,

      orderable: true,

      price: 3.49,

      selectedCustomOptions: null,

      selectedToppings: null,

      toppingsThresholdCount: 0,

      toppingsThresholdMessage: null,

      servings: '',

      bannerId: null,
    },
  ]

  // Custom comparator to compare all properties except orderId
  interface Item {
    itemId: number
    quantity: number
    menuItemCode: string
    itemName?: string
  }

  interface Order {
    locationNumber: string
    orderId: number
    items: Item[]
  }

  interface MenuItem {
    itemId: number
    itemName: string
  }

  const comparator = (a: Order, b: Order): boolean => {
    return _isEqual(_omit(a, 'orderId'), _omit(b, 'orderId'))
  }

  // Remove duplicate orders based on the custom comparator
  let uniqueOrders = _uniqWith(savedOrders, comparator)

  console.log('savedOrders', savedOrders)
  console.log('uniqueOrders', uniqueOrders)

  uniqueOrders = _uniqWith([...currentOrder, ...uniqueOrders], comparator)

  // Add itemName to each item in savedOrders
  const updatedOrders = uniqueOrders.map(order => {
    const updatedItems = order.items.map(item => {
      const menuItem = _find(storeMenu, { itemId: item.itemId })
      return {
        ...item,
        itemName: menuItem ? menuItem.itemName : 'Unknown Item',
      }
    })
    return {
      ...order,
      items: updatedItems,
    }
  })

  return (
    <div>
      <h1>Playground</h1>
      <button onClick={() => setValue(value + 1)}>Increment</button>
      <p>{value}</p>

      {_map(updatedOrders, item => {
        console.log('item', item)
        return (
          <div
            key={item.orderId}
            style={{
              border: '1px solid rgba(255,255, 255, 1)',
              padding: '10px',
              margin: '10px',
              textDecoration: 'none',
            }}
          >
            <p>Location Number: {item.locationNumber}</p>
            <p>Order ID: {item.orderId}</p>
            <p>Items:</p>
            <ul>
              {item.items.map(subItem => (
                <li key={subItem.itemId} style={{ listStyleType: 'none' }}>
                  <div>{subItem.itemId}</div>
                  <div>{subItem.itemName}</div>
                  {subItem.menuItemCode} - Quantity: {subItem.quantity}
                </li>
              ))}
            </ul>
            <button
              onClick={() => console.log(`Button ${item.orderId} clicked`)}
            >
              {`Submit Order ${item.orderId}`}
            </button>
          </div>
        )
      })}
    </div>
  )
}
