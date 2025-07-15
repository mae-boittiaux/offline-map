export const renderRules = [
    {
        // key: building, value: N/A
        condition: (element) => element.tags.some(({ key }) => key === 'building'),
        styles: {
            fillStyle: "#d9d0c9",
            strokeStyle: "#c4b7a9",
            shouldFill: true,
            zIndex: 3,
        },
    },
    {
        // key: highway, value: footway
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'footway'),
        styles: {
            fillStyle: "",
            strokeStyle: "#fa8072",
            shouldFill: false,
            zIndex: 4,
        },
    },
    {
        // key: highway, value: pedestrian
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'pedestrian'),
        styles: {
            fillStyle: "#dddde8",
            strokeStyle: "#aaaaad",
            shouldFill: true,
            zIndex: 3,
        },
    },
    {
        // key: landuse, value: forest
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'forest'),
        styles: {
            fillStyle: "#add19e",
            strokeStyle: "#95a986",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: grass
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'grass'),
        styles: {
            fillStyle: "#cdebb0",
            strokeStyle: "#abbb9d",
            shouldFill: true,
            zIndex: 3,
        },
    },
    {
        // key: landuse, value: residential
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'residential'),
        styles: {
            fillStyle: "#e0dfdf",
            strokeStyle: "#d0cfce",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: farmyard
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'farmyard'),
        styles: {
            fillStyle: "#f5dcba",
            strokeStyle: "#dbc29b",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: landfill
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'landfill'),
        styles: {
            fillStyle: "#b6b592",
            strokeStyle: "#b39856",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: plant_nursery
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'plant_nursery'),
        styles: {
            fillStyle: "#aedfa3",
            strokeStyle: "#518f45",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: military
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'military'),
        styles: {
            fillStyle: "#f3e3dd",
            strokeStyle: "#dcc6c0",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: recreation_ground
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'recreation_ground'),
        styles: {
            fillStyle: "#dffce2",
            strokeStyle: "#9eada1",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: amenity, value: parking
        condition: (element) => element.tags.some(({ key, value }) => key === 'amenity' && value === 'parking'),
        styles: {
            fillStyle: "#eeeeee",
            strokeStyle: "#d9cbc6",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: leisure, value: pitch
        condition: (element) => element.tags.some(({ key, value }) => key === 'leisure' && value === 'pitch'),
        styles: {
            fillStyle: "#88e0be",
            strokeStyle: "#6bcea5",
            shouldFill: true,
            zIndex: 3,
        },
    },
    {
        // key: leisure, value: garden
        condition: (element) => element.tags.some(({ key, value }) => key === 'leisure' && value === 'garden'),
        styles: {
            fillStyle: "#cdebb0",
            strokeStyle: "#8ab773",
            shouldFill: true,
            zIndex: 3,
        },
    },
    {
        // key: natural, value: wood
        condition: (element) => element.tags.some(({ key, value }) => key === 'natural' && value === 'wood'),
        styles: {
            fillStyle: "#add19e",
            strokeStyle: "#93b685",
            shouldFill: true,
            zIndex: 3,
        },
    },
    {
        // key: natural, value: grassland
        condition: (element) => element.tags.some(({ key, value }) => key === 'natural' && value === 'grassland'),
        styles: {
            fillStyle: "#cdebb0",
            strokeStyle: "#7e8577",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: natural, value: wetland
        condition: (element) => element.tags.some(({ key, value }) => key === 'natural' && value === 'wetland'),
        styles: {
            fillStyle: "#cdebb0",
            strokeStyle: "#76b588",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: natural, value: scrub
        condition: (element) => element.tags.some(({ key, value }) => key === 'natural' && value === 'scrub'),
        styles: {
            fillStyle: "#c8d7ab",
            strokeStyle: "#b0be93",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: natural, value: water
        condition: (element) => element.tags.some(({ key, value }) => key === 'natural' && value === 'water'),
        styles: {
            fillStyle: "#aad3df",
            strokeStyle: "#87a8e0",
            shouldFill: true,
            zIndex: 3,
        },
    },
    {
        // key: waterway, value: stream
        condition: (element) => element.tags.some(({ key, value }) => key === 'waterway' && value === 'stream'),
        styles: {
            fillStyle: "#aad3df",
            strokeStyle: "#87a8e0",
            shouldFill: true,
            zIndex: 3,
        },
    },
    {
        // key: landuse, value: retail
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'retail'),
        styles: {
            fillStyle: "#ffd6d1",
            strokeStyle: "#ebbbb5",
            shouldFill: true,
            zIndex: 1,
        },
    },
    {
        // key: landuse, value: construction
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'construction'),
        styles: {
            fillStyle: "#c7c7b4",
            strokeStyle: "#919a87",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: commercial
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'commercial'),
        styles: {
            fillStyle: "#f2dad9",
            strokeStyle: "#ddc4c3",
            shouldFill: true,
            zIndex: 1,
        },
    },
    {
        // key: landuse, value: industrial
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'industrial'),
        styles: {
            fillStyle: "#ebdbe8",
            strokeStyle: "#d2c2ce",
            shouldFill: true,
            zIndex: 1,
        },
    },
    {
        // key: man_made, value: wastewater_plant
        condition: (element) => element.tags.some(({ key, value }) => key === 'man_made' && value === 'wastewater_plant'),
        styles: {
            fillStyle: "#ebdbe8",
            strokeStyle: "#d2c2ce",
            shouldFill: true,
            zIndex: 1,
        },
    },
    {
        // key: landuse, value: allotments
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'allotments'),
        styles: {
            fillStyle: "#c9e1bf",
            strokeStyle: "#b6cfab",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: religious
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'religious'),
        styles: {
            fillStyle: "#d0d0d0",
            strokeStyle: "#9a9a9a",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: leisure, value: park
        condition: (element) => element.tags.some(({ key, value }) => key === 'leisure' && value === 'park'),
        styles: {
            fillStyle: "#c8facc",
            strokeStyle: "#8fd794",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: leisure, value: golf_course
        condition: (element) => element.tags.some(({ key, value }) => key === 'leisure' && value === 'golf_course'),
        styles: {
            fillStyle: "#def6c0",
            strokeStyle: "#add19e",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: farmland
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'farmland'),
        styles: {
            fillStyle: "#eef0d5",
            strokeStyle: "#dbddc4",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: quarry
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'quarry'),
        styles: {
            fillStyle: "#c5c3c3",
            strokeStyle: "#8e8c8c",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: landuse, value: meadow
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'meadow'),
        styles: {
            fillStyle: "#cdebb0",
            strokeStyle: "#97a886",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: natural, value: sand
        condition: (element) => element.tags.some(({ key, value }) => key === 'natural' && value === 'sand'),
        styles: {
            fillStyle: "#f5e9c6",
            strokeStyle: "#e7cfc3",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: amenity, value: N/A
        condition: (element) => element.tags.some(({ key }) => key === 'amenity'),
        styles: {
            fillStyle: "#ffffe5",
            strokeStyle: "#e1dac6",
            shouldFill: true,
            zIndex: 1,
        },
    },
    {
        // key: landuse, value: cemetery
        condition: (element) => element.tags.some(({ key, value }) => key === 'landuse' && value === 'cemetery'),
        styles: {
            fillStyle: "#aacbaf",
            strokeStyle: "#88b78e",
            shouldFill: true,
            zIndex: 2,
        },
    },
    {
        // key: highway, value: motorway
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'motorway'),
        styles: {
            fillStyle: "",
            strokeStyle: "#e892a2",
            shouldFill: false,
            zIndex: 4,
            lineWidth: 12,
            hasCasing: true,
            casingStrokeStyle: "#de3d72"
        },
    },
    {
        // key: highway, value: motorway_link
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'motorway_link'),
        styles: {
            fillStyle: "",
            strokeStyle: "#e892a2",
            shouldFill: false,
            zIndex: 4,
            lineWidth: 6,
            hasCasing: true,
            casingStrokeStyle: "#de3d72"
        },
    },
    {
        // key: highway, value: primary
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'primary'),
        styles: {
            fillStyle: "",
            strokeStyle: "#fcd6a4",
            shouldFill: false,
            zIndex: 4,
            lineWidth: 10,
            hasCasing: true,
            casingStrokeStyle: "#c49540"
        },
    },
    {
        // key: highway, value: secondary
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'secondary'),
        styles: {
            fillStyle: "",
            strokeStyle: "#f7fabf",
            shouldFill: false,
            zIndex: 4,
            lineWidth: 8,
            hasCasing: true,
            casingStrokeStyle: "#bcc46f"
        },
    },
    {
        // key: highway, value: tertiary
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'tertiary'),
        styles: {
            fillStyle: "",
            strokeStyle: "#fdfdfd",
            shouldFill: false,
            zIndex: 3,
            lineWidth: 6,
            hasCasing: true,
            casingStrokeStyle: "#a4a3a3"
        },
    },
    {
        // key: highway, value: service
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'service'),
        styles: {
            fillStyle: "",
            strokeStyle: "#fdfdfd",
            shouldFill: false,
            zIndex: 2,
            lineWidth: 2,
            hasCasing: true,
            casingStrokeStyle: "#a4a3a3"
        },
    },
    {
        // key: highway, value: unclassified
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'unclassified'),
        styles: {
            fillStyle: "",
            strokeStyle: "#fdfdfd",
            shouldFill: false,
            zIndex: 2,
            lineWidth: 2,
            hasCasing: true,
            casingStrokeStyle: "#a4a3a3"
        },
    },
    {
        // key: highway, value: residential
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'residential'),
        styles: {
            fillStyle: "",
            strokeStyle: "#fdfdfd",
            shouldFill: false,
            zIndex: 3,
            lineWidth: 4,
            hasCasing: true,
            casingStrokeStyle: "#a4a3a3"
        },
    },
    {
        // key: railway, value: rail
        condition: (element) => element.tags.some(({ key, value }) => key === 'railway' && value === 'rail'),
        styles: {
            fillStyle: "#707070",
            strokeStyle: "#707070",
            shouldFill: true,
            zIndex: 3,
            lineWidth: 2,
            hasCasing: true,
            casingStrokeStyle: "#707070"
        },
    },
    {
        // key: highway, value: trunk
        condition: (element) => element.tags.some(({ key, value }) => key === 'highway' && value === 'trunk'),
        styles: {
            fillStyle: "",
            strokeStyle: "#f9b29c",
            shouldFill: false,
            zIndex: 3,
            lineWidth: 8,
            hasCasing: true,
            casingStrokeStyle: "#cc583a"
        },
    },
    {
        // default styles
        condition: () => true,
        styles: {
            fillStyle: "",
            strokeStyle: "",
            shouldFill: false,
            zIndex: 0,
        },
    },
];
