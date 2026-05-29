export interface ClientErrorReportRequestDTO {
  message: string;
  name: string;
  stack?: string;
  cause?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  userAgent?: string;
  environment?: string;
  timestamp?: string;
  metadata?: string;
}
