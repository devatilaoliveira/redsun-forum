package com.rpg.redsunapi.configuration;

import com.rpg.redsunapi.storage.StorageClient;
import com.rpg.redsunapi.storage.SupabaseStorageClient;
import com.rpg.redsunapi.supabase.SupabaseAuthAdminClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SupabaseConfig {

  @Bean
  public StorageClient supabaseStorageClient(
    @Value("${supabase.url}") String supabaseUrl,
    @Value("${supabase.secret-key}") String secretKey
  ) {
    return new SupabaseStorageClient(supabaseUrl, secretKey);
  }

  @Bean
  public SupabaseAuthAdminClient supabaseAuthAdminClient(
    @Value("${supabase.url}") String supabaseUrl,
    @Value("${supabase.secret-key}") String secretKey
  ) {
    return new SupabaseAuthAdminClient(supabaseUrl, secretKey);
  }
}
