import { apiService } from 'ts-api-toolkit';

apiService.changeBaseUrl('https://api.realworld.show/api');
apiService.changeAuthSchema('Token');

export function errorHandler(error: { data?: { [key: string]: string[] } }, fallbackMessage: string) {
	return error?.data?.errors ? error.data.errors : { unknown: [fallbackMessage] };
}

export { apiService };
