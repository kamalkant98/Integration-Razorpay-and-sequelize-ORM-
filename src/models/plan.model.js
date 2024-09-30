export default  (sequelize, DataTypes) => {
    const Plan = sequelize.define('Plan', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        duration: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: 'Duration in days',
        },
        currency: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'USD',
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive'),
          allowNull: false,
          defaultValue: 'active',
        },
      }, {
        timestamps: true, // createdAt and updatedAt will be generated automatically
      });
  
    return Plan;
  };
  
  