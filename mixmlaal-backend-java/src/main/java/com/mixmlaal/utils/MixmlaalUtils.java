package com.mixmlaal.utils;

/**
 * MIXMLAAL Java Utility Class
 * 提供项目通用工具方法
 */
public class MixmlaalUtils {

    /**
     * 生成唯一ID
     * @return 唯一ID字符串
     */
    public static String generateUniqueId() {
        return System.currentTimeMillis() + "-" + (int)(Math.random() * 10000);
    }

    /**
     * 验证邮箱格式
     * @param email 邮箱地址
     * @return 是否有效
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return email.matches("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    }

    /**
     * 计算字符串哈希值
     * @param input 输入字符串
     * @return 哈希值
     */
    public static int hashString(String input) {
        if (input == null) {
            return 0;
        }
        int hash = 0;
        for (char c : input.toCharArray()) {
            hash = 31 * hash + c;
        }
        return hash;
    }

    /**
     * 主方法用于测试
     */
    public static void main(String[] args) {
        System.out.println("MIXMLAAL Java Utils Test");
        System.out.println("Unique ID: " + generateUniqueId());
        System.out.println("Email test (test@example.com): " + isValidEmail("test@example.com"));
        System.out.println("Hash test: " + hashString("MIXMLAAL"));
    }
}
