export const MARKUP_TYPES = {
    TEXT: {
        type: 9,
    },
    CALLOUT: {
        type: 6,
        subType: 6,
    },
    NOTE: {
        type: 10,
        subType: 0,
    },
    SHAPE: {
        RECTANGLE: {
            type: 3,
            subType: 0,
        },
        ROUNDED_RECTANGLE: {
            type: 3,
            subType: 1,
        },
        ELLIPSE: {
            type: 4,
        },
        POLYGON: {
            type: 1,
            subType: 2,
        },
        CLOUD: {
            type: 5,
            subtype: 0,
        }
    },
    ERASE: {
        type: 0,
        subType: 1,
    },
    ARROW: {
        type: 6,
        SINGLE_END: {
            type: 6,
            subtype: 0
        },
        FILLED_SINGLE_END: {
            type: 6,
            subtype: 1
        },
        BOTH_ENDS: {
            type: 6,
            subtype: 2
        },
        FILLED_BOTH_ENDS: {
            type: 6,
            subtype: 3,
        },
    },
    PAINT: {
        HIGHLIGHTER: {
            type: 3,
            subType: 3,
        },
        FREEHAND: {
            type: 0, 
            subType: 0,
        },
        POLYLINE: {
            type: 1, 
            subType: 1,
        },
    },
    COUNT: {
        type: 13,
    },
    STAMP: {
        type: 11,
        subType: 1,
    },
    MEASURE: {
        LENGTH: {
            type: 7,
        },
        AREA: {
            type: 8,
            subType: 0,
        },
        PATH: {
            type: 1,
            subType: 3,
        },
        RECTANGLE: {
            type: 3,
            subType: 6,
        },
    },
    SIGNATURE: {
        type: 11,
        subType: 3,
    },
    LINK: {
        type: 20
        },
    INTERACTIVESTAMP: {
        type: 21
        },
}
export const METRIC = {
    UNIT_TYPES: {
        'METRIC': '0',
        'IMPERIAL': '1',
        'SYSTEM': '2',
        'CUSTOM': '3'
    },
    UNIT_TITLES: {
        '0': 'Metric',
        '1': 'Imperial'
        //2: 'System',
        //3: 'Custom'
    },
    UNITS: {
        '0': {
            'MILLIMETER': 'Millimeter',
            'CENTIMETER': 'Centimeter',
            'DECIMETER': 'Decimeter',
            'METER': 'Meter',
            'KILOMETER': 'Kilometer',
            'NAUTICAL_MILES': 'Nautical Miles'
        },
        '1': {
            'INCH': 'Inch',
            'FEET': 'Feet',
            'YARD': 'Yard',
            'MILE': 'Mile',
            'NAUTICAL_MILES': 'Nautical Miles'

        },
        'SCALES':  ['1:1',
            '1:2',
            '1:3',
            '1:4',
            '1:5',
            '1:6',
            '1:7',
            '1:8',
            '1:9',
            '1:10',
            '1:12',
            '1:16',
            '1:20',
            '1:25',
            '1:32',
            '1:48',
            '1:50',
            '1:64',
            '1:75',
            '1:80',
            '1:96',
            '1:100',
            '1:150',
            '1:200',
            '1:250',
            '1:300',
            '1:500',
            '1:1000',
            '1:1250',
            '1:2000',
            '1:2500',
            '1:5000',
            '1:10000',
            '2:1',
            '4:1',                
            '5:1',
            '10:1',
            '20:1',
            '25:1',
            '50:1',
            '100:1',
            '200:1',
            '500:1',
            '1000:1',
            '10000:1',
            'Calibration']

    }
};