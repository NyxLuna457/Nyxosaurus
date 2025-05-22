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
      collapsible: true,
      collapsed: false
    },
    {
      type: 'category',
      label: 'Tutorial Basics',
      items: [
        'Tutorial Basics/congratulations',
        'Tutorial Basics/create-a-blog-post',
        'Tutorial Basics/create-a-document',
        'Tutorial Basics/create-a-page',
        'Tutorial Basics/deploy-your-site',
        'Tutorial Basics/markdown-features'
      ]
    },
    {
      type: 'category',
      label: 'Tutorial Extras',
      items: [
        'Tutorial Extras/manage-docs-versions',
        'Tutorial Extras/translate-your-site'
      ]
    },
    'intro'
  ]
};