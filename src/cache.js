import NodeCache from 'node-cache';

// Configuração do cache com tempo de expiração de 5 minutos (300 segundos)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

export default cache;
