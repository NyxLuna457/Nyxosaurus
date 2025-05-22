// @ts-check

/**
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
module.exports = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Projet Application Python',
      link: {
        type: 'generated-index',
        title: 'Projet Application Python'
      },
      items: [
        'Projet-Application-Python/Créer-une-application-Python',
        'Projet-Application-Python/Connecter-une-BD-à-une-application-Python',
        'Projet-Application-Python/Integrer-une-DB-a-une-page-web',
        'Projet-Application-Python/Dns-ou-Reverse-Proxy',
        'Projet-Application-Python/Monitoring',
        'Projet-Application-Python/Mise-en-place-CICD'
      ],
    }
  ]
};