'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('morceaux_texte', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true
      },
      contenu: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('paragraphe', 'dialogue', 'citation'),
        allowNull: false,
        defaultValue: 'paragraphe'
      },
      ordre: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      dateCreation: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      dateModification: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      chapitreId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chapitres',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Ajouter un index unique sur la combinaison chapitreId + ordre
    await queryInterface.addIndex('morceaux_texte', ['chapitreId', 'ordre'], {
      unique: true,
      name: 'unique_chapter_text_order'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('morceaux_texte');
  }
}; 