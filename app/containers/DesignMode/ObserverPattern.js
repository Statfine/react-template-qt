/* eslint-disable */
/**
 * 观察者模式
*/

class Subject {
  // 构造函数
  constructor() {
    this.observerCollection = [];
  }

  // 注册观察者
  registerObserver(observer) {
    this.observerCollection.push(observer);
  }

  // 移除观察者
  unRegisterObserver(observer) {
    const observerIndex = this.observerCollection.findIndex((o) => o.name === observer.name);
    this.observerCollection.splice(observerIndex, 1);
  }

  // 通知观察者
  notifyObserver(subject) {
    const observerS = this.observerCollection;
    const observerLength = observerS.length;
    if (observerLength > 0) {
      for (let observer of observerS) {
        observer.update(subject);
      }
    }
  }
}

// 观察者
class Observer {
  update() {
    console.log('Observer')
  }
}

class Todo extends Subject {
  constructor() {
    super();
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
    super.notifyObserver(this);
  }

  removeItem(item) {
    const itemIndex = this.items.findIndex((v) => v === item);
    this.items.splice(itemIndex, 1);
    super.notifyObserver(this);
  }
}

class ListObserver extends Observer {
  constructor(name) {
    super();
    this.name = name;
  }

  update(todo) {
    super.update();
    const items = todo.items;
    for(let item of items) {
      console.log('ListObserver', item);
    }
  }
}

class CountObserver extends Observer {
  constructor(name) {
    super();
    this.name = name;
  }

  update(todo) {
    const items = todo.items;
    console.log('CountObserver', items.length);
  }
}

const todo = new Todo();
const listObserver = new ListObserver('ListObserver');
const countObserver = new CountObserver('CountObserver');

todo.registerObserver(listObserver);
todo.registerObserver(countObserver);

todo.addItem('item1');
todo.addItem('item2');
todo.addItem('item3');

todo.unRegisterObserver(countObserver);

todo.addItem('item4');