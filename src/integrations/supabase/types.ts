export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          cep: string
          city: string
          complement: string | null
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string
          neighborhood: string
          number: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          cep: string
          city: string
          complement?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string
          neighborhood: string
          number: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          cep?: string
          city?: string
          complement?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string
          neighborhood?: string
          number?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_communications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          recipient_id: string | null
          sender_id: string
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          recipient_id?: string | null
          sender_id: string
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          recipient_id?: string | null
          sender_id?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_communications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_communications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      advanced_category_mappings: {
        Row: {
          api_connection_id: string
          auto_mapped: boolean | null
          confidence_score: number | null
          created_at: string
          id: string
          local_category_id: string | null
          mapping_rules: Json | null
          marketplace_category_path: string
          updated_at: string
        }
        Insert: {
          api_connection_id: string
          auto_mapped?: boolean | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          local_category_id?: string | null
          mapping_rules?: Json | null
          marketplace_category_path: string
          updated_at?: string
        }
        Update: {
          api_connection_id?: string
          auto_mapped?: boolean | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          local_category_id?: string | null
          mapping_rules?: Json | null
          marketplace_category_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advanced_category_mappings_api_connection_id_fkey"
            columns: ["api_connection_id"]
            isOneToOne: false
            referencedRelation: "api_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advanced_category_mappings_local_category_id_fkey"
            columns: ["local_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      api_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean | null
          marketplace_name: string | null
          message: string
          resolved_at: string | null
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          marketplace_name?: string | null
          message: string
          resolved_at?: string | null
          severity?: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          marketplace_name?: string | null
          message?: string
          resolved_at?: string | null
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_connections: {
        Row: {
          api_key_reference: string | null
          connection_name: string
          connection_status: string | null
          created_at: string
          id: string
          is_active: boolean | null
          last_test_at: string | null
          marketplace_name: string
          oauth_access_token: string | null
          oauth_expires_at: string | null
          oauth_refresh_token: string | null
          rate_limit_remaining: number | null
          rate_limit_reset_at: string | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_reference?: string | null
          connection_name: string
          connection_status?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          marketplace_name: string
          oauth_access_token?: string | null
          oauth_expires_at?: string | null
          oauth_refresh_token?: string | null
          rate_limit_remaining?: number | null
          rate_limit_reset_at?: string | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_reference?: string | null
          connection_name?: string
          connection_status?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          marketplace_name?: string
          oauth_access_token?: string | null
          oauth_expires_at?: string | null
          oauth_refresh_token?: string | null
          rate_limit_remaining?: number | null
          rate_limit_reset_at?: string | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_metrics: {
        Row: {
          created_at: string
          endpoint: string | null
          error_message: string | null
          id: string
          marketplace_name: string
          operation_type: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number | null
          success: boolean | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          id?: string
          marketplace_name: string
          operation_type: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          success?: boolean | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          id?: string
          marketplace_name?: string
          operation_type?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          success?: boolean | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          product_id: string
          quantity: number
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          order: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          order?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_category_mappings: {
        Row: {
          created_at: string
          id: string
          marketplace_category_id: string
          marketplace_category_name: string
          marketplace_name: string
          updated_at: string
          xegai_category_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          marketplace_category_id: string
          marketplace_category_name: string
          marketplace_name: string
          updated_at?: string
          xegai_category_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          marketplace_category_id?: string
          marketplace_category_name?: string
          marketplace_name?: string
          updated_at?: string
          xegai_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_category_mappings_xegai_category_id_fkey"
            columns: ["xegai_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          api_connection_id: string
          attributes: Json | null
          auto_sync_enabled: boolean | null
          available_quantity: number | null
          brand: string | null
          categories: string[] | null
          condition: string | null
          created_at: string
          currency: string | null
          description: string | null
          gtin: string | null
          id: string
          images: string[] | null
          is_imported: boolean | null
          last_sync_at: string | null
          local_product_id: string | null
          marketplace_name: string
          marketplace_product_id: string
          marketplace_url: string | null
          markup_type: string | null
          markup_value: number | null
          model: string | null
          original_price: number | null
          price: number
          profit_margin: number | null
          seller_info: Json | null
          shipping_info: Json | null
          sku: string | null
          sold_quantity: number | null
          sync_errors: string[] | null
          sync_status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          api_connection_id: string
          attributes?: Json | null
          auto_sync_enabled?: boolean | null
          available_quantity?: number | null
          brand?: string | null
          categories?: string[] | null
          condition?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          gtin?: string | null
          id?: string
          images?: string[] | null
          is_imported?: boolean | null
          last_sync_at?: string | null
          local_product_id?: string | null
          marketplace_name: string
          marketplace_product_id: string
          marketplace_url?: string | null
          markup_type?: string | null
          markup_value?: number | null
          model?: string | null
          original_price?: number | null
          price: number
          profit_margin?: number | null
          seller_info?: Json | null
          shipping_info?: Json | null
          sku?: string | null
          sold_quantity?: number | null
          sync_errors?: string[] | null
          sync_status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          api_connection_id?: string
          attributes?: Json | null
          auto_sync_enabled?: boolean | null
          available_quantity?: number | null
          brand?: string | null
          categories?: string[] | null
          condition?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          gtin?: string | null
          id?: string
          images?: string[] | null
          is_imported?: boolean | null
          last_sync_at?: string | null
          local_product_id?: string | null
          marketplace_name?: string
          marketplace_product_id?: string
          marketplace_url?: string | null
          markup_type?: string | null
          markup_value?: number | null
          model?: string | null
          original_price?: number | null
          price?: number
          profit_margin?: number | null
          seller_info?: Json | null
          shipping_info?: Json | null
          sku?: string | null
          sold_quantity?: number | null
          sync_errors?: string[] | null
          sync_status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_api_connection_id_fkey"
            columns: ["api_connection_id"]
            isOneToOne: false
            referencedRelation: "api_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_local_product_id_fkey"
            columns: ["local_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_sync_logs: {
        Row: {
          completed_at: string | null
          errors: string[] | null
          id: string
          marketplace_name: string
          operation_type: string
          products_imported: number | null
          products_processed: number | null
          products_updated: number | null
          started_at: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          errors?: string[] | null
          id?: string
          marketplace_name: string
          operation_type: string
          products_imported?: number | null
          products_processed?: number | null
          products_updated?: number | null
          started_at?: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          errors?: string[] | null
          id?: string
          marketplace_name?: string
          operation_type?: string
          products_imported?: number | null
          products_processed?: number | null
          products_updated?: number | null
          started_at?: string
          status?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          status?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_returns: {
        Row: {
          created_at: string
          id: string
          marketplace_return_id: string | null
          order_id: string
          order_item_id: string | null
          processed_at: string | null
          reason: string
          refund_amount: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          marketplace_return_id?: string | null
          order_id: string
          order_item_id?: string | null
          processed_at?: string | null
          reason: string
          refund_amount?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          marketplace_return_id?: string | null
          order_id?: string
          order_item_id?: string | null
          processed_at?: string | null
          reason?: string
          refund_amount?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_returns_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          marketplace_order_id: string | null
          marketplace_status: string | null
          return_reason: string | null
          return_requested_at: string | null
          return_status: string | null
          shipping_address: Json | null
          status: string
          total: number
          tracking_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          marketplace_order_id?: string | null
          marketplace_status?: string | null
          return_reason?: string | null
          return_requested_at?: string | null
          return_status?: string | null
          shipping_address?: Json | null
          status?: string
          total: number
          tracking_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          marketplace_order_id?: string | null
          marketplace_status?: string | null
          return_reason?: string | null
          return_requested_at?: string | null
          return_status?: string | null
          shipping_address?: Json | null
          status?: string
          total?: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
          tags: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_name: string
          metric_type?: string
          metric_value: number
          tags?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          tags?: Json | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          marketplace_name: string | null
          name: string
          original_price: number | null
          price: number
          sizes: string[] | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          marketplace_name?: string | null
          name: string
          original_price?: number | null
          price: number
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          marketplace_name?: string | null
          name?: string
          original_price?: number | null
          price?: number
          sizes?: string[] | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          document: string | null
          full_name: string | null
          gender: string | null
          id: string
          last_login: string | null
          login_count: number | null
          marketing_consent: boolean | null
          phone: string | null
          status: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          document?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          last_login?: string | null
          login_count?: number | null
          marketing_consent?: boolean | null
          phone?: string | null
          status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          document?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          last_login?: string | null
          login_count?: number | null
          marketing_consent?: boolean | null
          phone?: string | null
          status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          order: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          order?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_executions: {
        Row: {
          api_connection_id: string
          completed_at: string | null
          errors: string[] | null
          execution_log: string | null
          execution_type: string
          id: string
          products_failed: number | null
          products_found: number | null
          products_imported: number | null
          products_processed: number | null
          products_updated: number | null
          started_at: string
          status: string | null
          summary: Json | null
          sync_schedule_id: string | null
        }
        Insert: {
          api_connection_id: string
          completed_at?: string | null
          errors?: string[] | null
          execution_log?: string | null
          execution_type: string
          id?: string
          products_failed?: number | null
          products_found?: number | null
          products_imported?: number | null
          products_processed?: number | null
          products_updated?: number | null
          started_at?: string
          status?: string | null
          summary?: Json | null
          sync_schedule_id?: string | null
        }
        Update: {
          api_connection_id?: string
          completed_at?: string | null
          errors?: string[] | null
          execution_log?: string | null
          execution_type?: string
          id?: string
          products_failed?: number | null
          products_found?: number | null
          products_imported?: number | null
          products_processed?: number | null
          products_updated?: number | null
          started_at?: string
          status?: string | null
          summary?: Json | null
          sync_schedule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_executions_api_connection_id_fkey"
            columns: ["api_connection_id"]
            isOneToOne: false
            referencedRelation: "api_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_executions_sync_schedule_id_fkey"
            columns: ["sync_schedule_id"]
            isOneToOne: false
            referencedRelation: "sync_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_schedules: {
        Row: {
          api_connection_id: string
          created_at: string
          cron_expression: string
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          run_count: number | null
          schedule_type: string
          settings: Json | null
          success_count: number | null
          updated_at: string
        }
        Insert: {
          api_connection_id: string
          created_at?: string
          cron_expression: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          run_count?: number | null
          schedule_type: string
          settings?: Json | null
          success_count?: number | null
          updated_at?: string
        }
        Update: {
          api_connection_id?: string
          created_at?: string
          cron_expression?: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          run_count?: number | null
          schedule_type?: string
          settings?: Json | null
          success_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_schedules_api_connection_id_fkey"
            columns: ["api_connection_id"]
            isOneToOne: false
            referencedRelation: "api_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          message: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          currency: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          marketing_emails: boolean | null
          newsletter: boolean | null
          privacy_level: string | null
          sms_notifications: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          newsletter?: boolean | null
          privacy_level?: string | null
          sms_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          newsletter?: boolean | null
          privacy_level?: string | null
          sms_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tag_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          tag_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tag_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "user_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tag_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      auto_optimize_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      automated_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_performance_alerts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fetch_categories_with_subcategories: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
          order: number
          slug: string
          subcategories: Json
          updated_at: string
        }[]
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_performance_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_users: number
          active_users_7d: number
          avg_login_count: number
          banned_users: number
          new_users_30d: number
          suspended_users: number
          total_users: number
        }[]
      }
      get_user_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_users: number
          active_users_7d: number
          avg_login_count: number
          banned_users: number
          new_users_30d: number
          suspended_users: number
          total_users: number
        }[]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin_cached: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_action: string
          p_description?: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: undefined
      }
      monitor_table_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          dead_tuple_percent: number
          dead_tuples: number
          needs_vacuum: boolean
          table_name: string
          table_size: string
          total_rows: number
        }[]
      }
      monitor_unused_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_name: string
          index_scans: number
          index_size: string
          schema_name: string
          table_name: string
        }[]
      }
      system_health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
