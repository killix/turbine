'use strict'

import Store from 'lib/Store'
import Immutable from 'immutable'

describe('Store', () => {
  let store, MyModel

  beforeEach(() => {
    MyModel = jasmine.createSpyObj('MyModel', ['query', 'find', 'create', 'update', 'delete'])
    store = new Store({
      models: {
        MyModel: MyModel
      }
    })
  })


  describe('getItem', () => {
    describe('not loaded yet', () => {
      it('returns undefined and calls loadItem', () => {
        const loadItem = spyOn(store, 'loadItem')
        expect(store.getItem('MyModel', '123')).toBeUndefined()
        expect(loadItem).toHaveBeenCalled()
      })
    })

    describe('already loaded', () => {
      beforeEach(() => {
        store._state.cursor(['MyModel'])(items => items.set('123', {id: '123', name: 'John'}))
      })

      it('returns item', () => {
        const item = store.getItem('MyModel', '123')
        expect(item.name).toBe('John')
      })
    })
  })


  describe('loadItem', () => {
    beforeEach(() => {
      MyModel.find.and.returnValue(new Promise(() => {}))
      store.loadItem('MyModel', {id: '123'})
    })

    it('triggers fetch', () => {
      expect(MyModel.find).toHaveBeenCalled()
    })

    it('triggers only one fetch at a time', () => {
      store.loadItem('MyModel', {id: '123'})
      expect(MyModel.find.calls.count()).toBe(1)
    })

    it('different key triggers fetch', () => {
      store.loadItem('MyModel', {id: '456'})
      expect(MyModel.find.calls.count()).toBe(2)
    })
  })


  describe('loadItemSuccess', () => {
    it('stores the item', () => {
      const john = new Immutable.Record({id: '123', name: 'John'})
      store.loadItemSuccess('MyModel', {id: '123'}, john)
      expect(store.getItem('MyModel', '123')).toBe(john)
    })
  })


  describe('loadItemFail', () => {
    it('marks the state as error', () => {
      store.loadItemFail('MyModel', {id: '123'}, {error: 'Not found'})
      expect(store.getItem('MyModel', '123')).toEqual({error: 'Not found'})
    })
  })


  describe('getList', () => {
    describe('not loaded yet', () => {
      it('returns undefined and calls loadList', () => {
        const loadList = spyOn(store, 'loadList')
        expect(store.getList()).toBeUndefined()
        expect(loadList).toHaveBeenCalled()
      })
    })

    describe('already loaded', () => {
      beforeEach(() => {
        store._lists('MyModel')(lists => lists.set('', new Immutable.List(['5', '2'])))
        store._items('MyModel')(items => items.set('5', {id: '5', name: 'John'}))
        store._items('MyModel')(items => items.set('2', {id: '2', name: 'Jack'}))
      })

      it('returns list', () => {
        const list = store.getList('MyModel')
        expect(list.first().id).toBe('5')
        expect(list.last().id).toBe('2')
      })
    })
  })


  describe('loadList', () => {
    beforeEach(() => {
      MyModel.query.and.returnValue(new Promise(() => {}))
      store.loadList('MyModel')
    })

    it('triggers fetch', () => {
      expect(MyModel.query).toHaveBeenCalled()
    })

    it('triggers only one fetch at a time', () => {
      store.loadList('MyModel')
      expect(MyModel.query.calls.count()).toBe(1)
    })

    it('different key triggers fetch', () => {
      store.loadList('MyModel', {stream_id: '456'})
      expect(MyModel.query.calls.count()).toBe(2)
    })
  })


  describe('loadListSuccess', () => {
    it('stores the list', () => {
      const list = new Immutable.List([{id: '123', name: 'John'}])
      store.loadListSuccess('MyModel', {}, list)
      expect(store.getList('MyModel')).toEqual(list)
    })
  })


  describe('loadListFail', () => {
    it('marks the state as error', () => {
      store.loadListFail('MyModel', {}, {error: 'Not found'})
      expect(store.getList('MyModel')).toEqual({error: 'Not found'})
    })
  })

})
