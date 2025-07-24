interface MockObjectId {
  toHexString(): string;
}

interface ObjectIdConstructor {
  new(): MockObjectId;
  (id?: string): MockObjectId;
  isValid(id: string): boolean;
}

// Make a function that acts both as a constructor and a regular function
const ObjectId = (function(this: any, id?: string) {
  if (!(this instanceof ObjectId)) {
    return new (ObjectId as any)(id);
  }

  const instance = {
    toHexString: () => id || Math.random().toString(36).substr(2, 9)
  };

  Object.setPrototypeOf(this, instance);
  return Object.assign(this, instance);
} as unknown) as ObjectIdConstructor;

// Add static methods to the ObjectId constructor
ObjectId.isValid = jest.fn().mockReturnValue(true);

interface ISchemaInstance {
  definition: any;
  options: any;
  pre: () => ISchemaInstance;
  index: () => ISchemaInstance;
  virtual: () => ISchemaInstance;
  path: (name: string) => any;
}

interface ISchemaConstructor {
  new (definition: any, options?: any): ISchemaInstance;
  Types: {
    ObjectId: typeof ObjectId;
    String: StringConstructor;
    Number: NumberConstructor;
    Boolean: BooleanConstructor;
    Date: DateConstructor;
    Array: ArrayConstructor;
    Map: MapConstructor;
    Buffer: BufferConstructor;
    Mixed: ObjectConstructor;
  };
}

interface IModelInstance extends jest.Mock {
  prototype: any;
  countDocuments: jest.Mock;
  findById: jest.Mock;
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  updateOne: jest.Mock;
  deleteOne: jest.Mock;
  aggregate: jest.Mock;
  populate: jest.Mock;
  exec: jest.Mock;
  lean: jest.Mock;
  save: jest.Mock;
  toObject: jest.Mock;
}

const mockSession = {
  startTransaction: jest.fn().mockResolvedValue(null),
  commitTransaction: jest.fn().mockResolvedValue(null),
  abortTransaction: jest.fn().mockResolvedValue(null),
  endSession: jest.fn().mockResolvedValue(null),
  withTransaction: jest.fn().mockImplementation(async (fn: any) => fn()),
};

const Schema = (function(this: ISchemaInstance, definition: any, options?: any) {
  if (!(this instanceof Schema)) {
    return new (Schema as any)(definition, options);
  }
  
  this.definition = definition;
  this.options = options || {};
  
  this.pre = function(this: ISchemaInstance) { return this; };
  this.index = function(this: ISchemaInstance) { return this; };
  this.virtual = function(this: ISchemaInstance) { return this; };
  this.path = function(this: ISchemaInstance, name: string) {
    return { ...this.definition[name] };
  };
  
  return this;
} as unknown) as ISchemaConstructor;

Schema.Types = {
  ObjectId,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Array: Array,
  Map: Map,
  Buffer: Buffer,
  Mixed: Object
};

interface IModels {
  [key: string]: IModelInstance;
}

const models: IModels = {};

const createMockDocument = (data: any) => {
  const doc = {
    ...data,
    _id: new ObjectId(),
    save: jest.fn().mockResolvedValue(data),
    toObject: jest.fn().mockReturnValue(data),
    session: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    execPopulate: jest.fn().mockResolvedValue(data),
  };
  return doc;
};

const createQueryMock = (defaultReturn: any = []) => {
  const query = {
    exec: jest.fn().mockResolvedValue(defaultReturn),
    lean: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
  };
  return query;
};

const modelFactory = jest.fn().mockImplementation((name: string, schema: any) => {
  if (!models[name]) {
    const ModelMock = jest.fn().mockImplementation((data: any) => createMockDocument(data));

    const staticMethods = {
      countDocuments: jest.fn().mockImplementation(() => createQueryMock(0)),
      find: jest.fn().mockImplementation(() => createQueryMock([])),
      findOne: jest.fn().mockImplementation(() => createQueryMock(null)),
      findById: jest.fn().mockImplementation(() => createQueryMock(null)),
      create: jest.fn().mockImplementation(data => {
        const doc = createMockDocument(data);
        return Promise.resolve(doc);
      }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      aggregate: jest.fn().mockResolvedValue([]),
    };

    Object.assign(ModelMock, staticMethods, {
      schema,
      prototype: {}
    });

    models[name] = ModelMock as IModelInstance;
  }
  return models[name];
});

const mockTypes = {
  ObjectId,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Array: Array,
  Map: Map,
  Buffer: Buffer,
  Mixed: Object
};

Schema.Types = mockTypes;


const mongoose = {
  Schema,
  model: modelFactory,
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  startSession: jest.fn().mockResolvedValue({
    ...mockSession,
    // For chaining
    endSession: jest.fn().mockResolvedValue(null),
  }),
  Types: mockTypes
};

module.exports = mongoose;

module.exports = mongoose;
