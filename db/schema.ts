import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

// User Model
export class User extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public passwordHash!: string;
    public createdAt!: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'user',
    timestamps: false,
});

// ContentCreator Model
export class ContentCreator extends Model {
    public id!: number;
    public userId!: number;
}

ContentCreator.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'content_creator',
    timestamps: false,
});

// Subscriber Model
export class Subscriber extends Model {
    public id!: number;
    public userId!: number;
}

Subscriber.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'subscriber',
    timestamps: false,
});

// Content Model
export class Content extends Model {
    public id!: number;
    public name!: string;
    public description!: string | null;
    public creatorId!: number;
    public modelInfo!: object;
    public isPublic!: boolean;
    public sharingId!: string;
    public ready!: boolean;
    public createdAt!: Date;
    public error!: string | null
}

Content.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    creatorId: {
        type: DataTypes.INTEGER,
        references: {
            model: ContentCreator,
            key: 'id',
        },
    },
    modelInfo: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    sharingId: {
        type: DataTypes.STRING,
        unique: true,
    },
    ready: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'content',
    timestamps: false,
});

// ContentRegistration Model
export class ContentRegistration extends Model {
    public id!: number;
    public subscriberId!: number;
    public contentId!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

ContentRegistration.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    subscriberId: {
        type: DataTypes.INTEGER,
        references: {
            model: Subscriber,
            key: 'id',
        },
    },
    contentId: {
        type: DataTypes.INTEGER,
        references: {
            model: Content,
            key: 'id',
        },
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'content_registration',
    timestamps: true,
});

// Thread Model
export class Thread extends Model {
    public id!: number;
    public name!: string;
    public subscriberId!: number;
    public contentId!: number;
    public messages!: object;
    public metaInfo!: object;
    public createdAt!: Date;
}

Thread.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    subscriberId: {
        type: DataTypes.INTEGER,
        references: {
            model: Subscriber,
            key: 'id',
        },
    },
    contentId: {
        type: DataTypes.INTEGER,
        references: {
            model: Content,
            key: 'id',
        },
    },
    messages: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
    metaInfo: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'thread',
    timestamps: false,
});

// Define Relationships
User.hasOne(ContentCreator, { foreignKey: 'userId' });
User.hasOne(Subscriber, { foreignKey: 'userId' });
ContentCreator.belongsTo(User, { foreignKey: 'userId' });
Subscriber.belongsTo(User, { foreignKey: 'userId' });

ContentCreator.hasMany(Content, { foreignKey: 'creatorId' });
Content.belongsTo(ContentCreator, { foreignKey: 'creatorId' });

Subscriber.hasMany(Thread, { foreignKey: 'subscriberId' });
Thread.belongsTo(Subscriber, { foreignKey: 'subscriberId' });

Subscriber.hasMany(ContentRegistration, { foreignKey: 'subscriberId' });
ContentRegistration.belongsTo(Subscriber, { foreignKey: 'subscriberId' });

Content.hasMany(ContentRegistration, { foreignKey: 'contentId' });
ContentRegistration.belongsTo(Content, { foreignKey: 'contentId' });

Content.hasMany(Thread, { foreignKey: 'contentId' });
Thread.belongsTo(Content, { foreignKey: 'contentId' });

export type UserAttributes = {
    id: number;
    name: string | null;
    email: string;
    passwordHash: string;
    createdAt: Date;
};

export type ContentAttributes = {
    id: number;
    name: string;
    description: string | null;
    creatorId: number;
    modelInfo: object;
    isPublic: boolean;
    sharingId: string | null;
    ready: boolean;
    createdAt: Date;
};

export type ThreadAttributes = {
    id: number;
    name: string;
    subscriberId: number;
    contentId: number;
    messages: object;
    metaInfo: object;
    createdAt: Date;
};