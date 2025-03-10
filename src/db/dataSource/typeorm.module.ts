import { DataSource, DataSourceOptions } from 'typeorm';
import { getDataFromJsonFile } from 'common/utils/fileUtils';

const environment = process.env.NODE_ENV || 'local';
// const configuration = getDataFromJsonFile('src/config/config.json');

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'onebill-stxnightfury-e9b8.d.aivencloud.com',
  port: 12310,
  username: 'avnadmin',
  password: 'AVNS_vKTduvlgiItdHNkZ3Z3',
  database: 'onebill',
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
};
const dataSource = new DataSource(dataSourceOptions);
dataSource.initialize();
export default dataSource;
