export default  (sequelize, DataTypes) => {
    const Subscription = sequelize.define('Subscription', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Users', // Name of the related table
            key: 'id',
          },
        },
        planId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Plans', // Name of the related table
            key: 'id',
          },
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired'),
          allowNull: false,
          defaultValue: 'active',
        }
      }, {
        timestamps: true, // createdAt and updatedAt will be managed automatically
        tableName: 'subscriptions', // Optional: to define a custom table name
      });
  
    return Subscription;
  };
  
  