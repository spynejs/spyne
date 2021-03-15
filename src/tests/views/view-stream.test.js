 import {ViewStream} from '../../spyne/views/view-stream';
// import * as R from 'ramda';

describe('ViewStream Tests', () => {


  describe("should validate nested arrays", ()=>{


    const eventsArrEmpty = [];
    var eventsArrNil;
    const eventsArrValid = [
      ['button', 'click']
    ];
    const eventsArrValid2 = [
      ['button', 'click'],
      ['a', 'focus'],
      ['#el', 'mouseover', 'local'],
      ['.element', 'focusout', ()=>{}]
    ];
    const eventsInvalid = [
      [
        ['button', 'click']
      ]
    ];

    const eventsInvalid2 = [
      ['button', ['button', 'click']]

    ];



    it('should ignore an empty array ', () => {
      const arrIsValid = ViewStream.isValidNestedArr(eventsArrEmpty)
      expect(arrIsValid).to.eq(true);
    });


    it('should ignore an undefined array ', () => {
      const arrIsValid = ViewStream.isValidNestedArr(eventsArrNil)
      expect(arrIsValid).to.eq(true);
    });

    it('should validate properly nested array ', () => {
      const arrIsValid = ViewStream.isValidNestedArr(eventsArrValid)
      expect(arrIsValid).to.eq(true);
    });

    it('should validate properly nested array with methods ', () => {
      const arrIsValid = ViewStream.isValidNestedArr(eventsArrValid2)
      expect(arrIsValid).to.eq(true);
    });

    it('should invalidate overly nested array ', () => {
      const arrIsValid = ViewStream.isValidNestedArr(eventsInvalid)
      expect(arrIsValid).to.eq(false);
    });

    it('should invalidate nested array containing nonstrings', () => {
      const arrIsValid = ViewStream.isValidNestedArr(eventsInvalid2)
      expect(arrIsValid).to.eq(false);
    });


  })


});
