import { DataSource } from 'typeorm';
import { dataSourceOptions } from './datasourceOptions';

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
