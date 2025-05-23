import React, { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';

export default function HomeRedirect() {
  const history = useHistory();

  useEffect(() => {
    // Redirige vers la page de doc voulue
    history.push('/Nyxosaurus/docs/category/projet-application-python');
  }, [history]);

  return null; // Pas d'affichage, redirection immédiate
}
