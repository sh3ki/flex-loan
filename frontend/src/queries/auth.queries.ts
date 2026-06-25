import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { LoginFormData } from '../schemas/auth.schema';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials: LoginFormData) => authService.login(credentials),
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => authService.logout(),
  });
};

export const useValidateQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['auth', 'validate'],
    queryFn: () => authService.validate(),
    enabled,
    retry: false,
  });
};
