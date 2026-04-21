import axios from "axios";
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

import { env } from "@/config";
import { mockApi } from "@/api/mock";
import type { Address, CatalogFilters, Order, PickupPoint, Product, Session } from "@/types/domain";

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const normalizedMessage =
      status === 401 ? "AUTH_EXPIRED" : (error?.response?.data?.message ?? "REQUEST_FAILED");

    return Promise.reject({
      status,
      message: normalizedMessage,
      original: error
    });
  }
);

export const queryKeys = {
  home: ["home"] as const,
  catalog: (filters?: CatalogFilters, page = 1) => ["catalog", filters, page] as const,
  product: (id: string) => ["product", id] as const,
  productReviews: (id: string) => ["product-reviews", id] as const,
  seller: (id: string) => ["seller", id] as const,
  sellerProducts: (id: string) => ["seller-products", id] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["order", id] as const,
  addresses: ["addresses"] as const,
  notifications: ["notifications"] as const,
  pickupPoints: (query?: string) => ["pickup-points", query] as const,
  paymentMethods: ["payment-methods"] as const
};

const staleTime = 1000 * 60 * 3;

export const useHomeQuery = () =>
  useQuery({
    queryKey: queryKeys.home,
    queryFn: () => mockApi.getHomeFeed(),
    staleTime
  });

export const useCatalogQuery = (page: number, filters?: CatalogFilters) =>
  useQuery({
    queryKey: queryKeys.catalog(filters, page),
    queryFn: () => mockApi.getCatalog(page, 8, filters),
    placeholderData: (previousData) => previousData,
    staleTime
  });

export const useProductQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => mockApi.getProduct(id),
    enabled: Boolean(id),
    staleTime
  });

export const useProductReviewsQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.productReviews(id),
    queryFn: () => mockApi.getProductReviews(id),
    enabled: Boolean(id),
    staleTime
  });

export const useSellerQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.seller(id),
    queryFn: () => mockApi.getSeller(id),
    enabled: Boolean(id),
    staleTime
  });

export const useSellerProductsQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.sellerProducts(id),
    queryFn: () => mockApi.getSellerProducts(id),
    enabled: Boolean(id),
    staleTime
  });

export const useOrdersQuery = () =>
  useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => mockApi.getOrders(),
    staleTime
  });

export const useOrderQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => mockApi.getOrder(id),
    enabled: Boolean(id),
    staleTime
  });

export const useAddressesQuery = () =>
  useQuery({
    queryKey: queryKeys.addresses,
    queryFn: () => mockApi.getAddresses(),
    staleTime
  });

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => mockApi.getNotifications(),
    staleTime
  });

export const usePickupPointsQuery = (query?: string) =>
  useQuery({
    queryKey: queryKeys.pickupPoints(query),
    queryFn: () => mockApi.getPickupPoints(query),
    staleTime
  });

export const usePaymentMethodsQuery = () =>
  useQuery({
    queryKey: queryKeys.paymentMethods,
    queryFn: () => mockApi.getPaymentMethods(),
    staleTime
  });

export const useTypedQuery = <TQueryFnData, TData = TQueryFnData>(
  options: UseQueryOptions<TQueryFnData, Error, TData>
) => useQuery(options);

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { firstName: string; lastName: string; email: string; phone: string }) =>
      mockApi.login(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    }
  });
};

export const usePlaceOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mockApi.placeOrder,
    onSuccess: async (order: Order) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.orders
      });
      await queryClient.setQueryData(queryKeys.order(order.id), order);
    }
  });
};

export const useAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<Address, "id" | "isDefault"> & { id?: string; isDefault?: boolean }) =>
      mockApi.upsertAddress(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.addresses
      });
    }
  });
};

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockApi.deleteAddress(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.addresses
      });
    }
  });
};

export type ApiClient = typeof apiClient;
export type MockSession = Session;
export type PickupPointQueryResult = PickupPoint[];
export type ProductQueryResult = Product | null;
