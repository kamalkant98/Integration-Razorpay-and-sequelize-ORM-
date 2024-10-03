function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  return `ORD-${date}-${randomNum}`;
}

export default  (sequelize, DataTypes) => {
    const Subscription = sequelize.define('Subscription', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        order_id: {
          type: DataTypes.STRING,
          // defaultValue: generateOrderId, // Use custom generator
          allowNull: true,
          unique: true
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'Users', // Name of the related table
            key: 'id',
          },
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        mobile: {
          type: DataTypes.INTEGER,
          allowNull: false,
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
          type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired,pending,processing'),
          allowNull: false,
          defaultValue: 'inactive',
        }
      }, {
        timestamps: true, // createdAt and updatedAt will be managed automatically
        tableName: 'subscriptions', // Optional: to define a custom table name
      });
  
    return Subscription;
  };
  
  