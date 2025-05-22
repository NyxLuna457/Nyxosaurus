// @ts-check

/**
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
module.exports = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'projet App python',
      link: {
        type: 'generated-index',
        title: 'Projet Application Python'
      },
      items: [
        'projet-app-python/apppython',
        'projet-app-python/dnslocal',
        'projet-app-python/mariadbperplexity',
        'projet-app-python/tablemariadb',
        'projet-app-python/monitoringgrafana',
        'projet-app-python/miseenplacecicd'
      ],
      collapsible: true,
      collapsed: false
    }
  ]
};