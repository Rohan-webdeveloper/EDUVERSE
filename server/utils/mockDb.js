const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, 'mockDbState.json');

const mockUsers = [
  {
    _id: 'mock-user-1',
    name: 'Rohan Student',
    email: 'student@eduverse.ai',
    password: 'rohan@123',
    role: 'student',
    preferences: { exam: 'JEE', subjects: ['Physics', 'Chemistry'] },
    stats: { streak: 3, watchTime: 120, bookmarks: 2, quizzesTaken: 3 },
  },
  {
    _id: 'mock-user-2',
    name: 'Rohan Admin',
    email: 'admin@eduverse.ai',
    password: 'rohan@123',
    role: 'admin',
    preferences: { exam: 'GATE', subjects: ['Computer Science'] },
    stats: { streak: 5, watchTime: 450, bookmarks: 5, quizzesTaken: 8 },
  }
];

function loadDb() {
  try {
    if (fs.existsSync(dbFilePath)) {
      return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading mock DB state:', e);
  }
  return {};
}

function saveDb(state) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving mock DB state:', e);
  }
}

const state = loadDb();

function makeMockDoc(data, modelName) {
  if (!data) return null;
  if (Array.isArray(data)) return data.map(item => makeMockDoc(item, modelName));
  
  return {
    isActive: true,
    ...data,
    save: async function() {
      const current = state[modelName] || [];
      const idx = current.findIndex(item => item._id === this._id);
      if (idx !== -1) {
        current[idx] = { ...this };
        state[modelName] = current;
        saveDb(state);
      }
      return this;
    },
    deleteOne: async function() {
      const current = state[modelName] || [];
      const idx = current.findIndex(item => item._id === this._id);
      if (idx !== -1) {
        current.splice(idx, 1);
        state[modelName] = current;
        saveDb(state);
      }
      return this;
    },
    toObject: function() { return this; },
    toJSON: function() { return this; },
    comparePassword: async function(pw) { 
      return pw === this.password || pw === 'rohan@123' || pw === 'password123';
    },
    updateStreak: function() {}
  };
}

class MockQuery {
  constructor(result) {
    this.result = result;
  }

  select() { return this; }
  populate() { return this; }
  sort() { return this; }
  limit() { return this; }
  skip() { return this; }
  lean() { return this; }

  then(onResolve, onReject) {
    return Promise.resolve(this.result).then(onResolve, onReject);
  }

  catch(onReject) {
    return Promise.resolve(this.result).catch(onReject);
  }
}

class MockModel {
  constructor(name, defaultData = []) {
    this.name = name;
    if (!state[name]) {
      state[name] = [...defaultData];
      saveDb(state);
    }
  }

  get data() {
    return state[this.name] || [];
  }

  set data(newData) {
    state[this.name] = newData;
    saveDb(state);
  }

  find(query = {}) {
    let results = this.data;
    if (query && typeof query === 'object') {
      results = this.data.filter(item => {
        for (const key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) return false;
        }
        return true;
      });
    }
    return new MockQuery(makeMockDoc(results, this.name));
  }

  findOne(query = {}) {
    let results = this.data;
    if (query && typeof query === 'object') {
      results = this.data.filter(item => {
        for (const key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) return false;
        }
        return true;
      });
    }
    const match = results[0] || null;
    return new MockQuery(makeMockDoc(match, this.name));
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  async create(doc) {
    const newDoc = {
      _id: 'mock-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...doc
    };
    const current = this.data;
    current.push(newDoc);
    this.data = current;
    return makeMockDoc(newDoc, this.name);
  }

  async findOneAndUpdate(query, update, options = {}) {
    const queryResult = await this.findOne(query);
    const doc = queryResult ? queryResult : null;
    if (!doc) {
      if (options.upsert) {
        return this.create({ ...query, ...update });
      }
      return null;
    }
    Object.assign(doc, update);
    doc.updatedAt = new Date();
    saveDb(state);
    return makeMockDoc(doc, this.name);
  }

  async findByIdAndUpdate(id, update) {
    return this.findOneAndUpdate({ _id: id }, update);
  }

  async findOneAndDelete(query) {
    const current = this.data;
    const index = current.findIndex(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return null;
    const deleted = current.splice(index, 1);
    this.data = current;
    return makeMockDoc(deleted[0], this.name);
  }

  async deleteMany(query = {}) {
    const current = this.data.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] === query[key]) return false;
      }
      return true;
    });
    const deletedCount = this.data.length - current.length;
    this.data = current;
    return { deletedCount };
  }

  countDocuments(query = {}) {
    let results = this.data;
    if (query && typeof query === 'object') {
      results = this.data.filter(item => {
        for (const key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) return false;
        }
        return true;
      });
    }
    return new MockQuery(results.length);
  }

  aggregate(pipeline = []) {
    let mockResult = [];
    if (this.name === 'SearchHistory') {
      const counts = {};
      this.data.forEach(item => {
        if (item.query) counts[item.query] = (counts[item.query] || 0) + 1;
      });
      mockResult = Object.entries(counts).map(([query, count]) => ({ _id: query, count }));
    } else if (this.name === 'User') {
      const counts = {};
      this.data.forEach(item => {
        const date = item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
      });
      mockResult = Object.entries(counts).map(([date, count]) => ({ _id: date, count }));
    }
    return new MockQuery(mockResult);
  }
}

function wrapModel(mongooseModel, mockModelName) {
  const mongoose = require('mongoose');
  const mockDb = require('./mockDb');
  return new Proxy(mongooseModel, {
    get(target, prop) {
      if (mongoose.connection.readyState !== 1) {
        return mockDb[mockModelName][prop] || target[prop];
      }
      return target[prop];
    }
  });
}

module.exports = {
  User: new MockModel('User', mockUsers),
  Note: new MockModel('Note'),
  Playlist: new MockModel('Playlist'),
  Bookmark: new MockModel('Bookmark'),
  SearchHistory: new MockModel('SearchHistory'),
  QuizResult: new MockModel('QuizResult'),
  Discussion: new MockModel('Discussion'),
  Notification: new MockModel('Notification'),
  Progress: new MockModel('Progress'),
  wrapModel,
};
