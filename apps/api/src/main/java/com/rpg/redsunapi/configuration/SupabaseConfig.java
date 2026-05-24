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
    @Value("${supabase.service-role-key}") String serviceRoleKey
  ) {
    return new SupabaseStorageClient(supabaseUrl, serviceRoleKey);
  }

  @Bean
  public SupabaseAuthAdminClient supabaseAuthAdminClient(
    @Value("${supabase.url}") String supabaseUrl,
    @Value("${supabase.service-role-key}") String serviceRoleKey
  ) {
    return new SupabaseAuthAdminClient(supabaseUrl, serviceRoleKey);
  }
}
