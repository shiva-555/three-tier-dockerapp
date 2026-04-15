# Use the lightweight Oracle Linux 9 MySQL image (smaller than default Debian)
FROM mysql:9.5.0-oraclelinux9

# Set only essential env vars (no extra layers)
ENV MYSQL_ROOT_PASSWORD=mysql123 \
    MYSQL_DATABASE=school

# Use a named volume instead of copying data (reduces image size)
VOLUME ["/var/lib/mysql"]

# Expose MySQL port
EXPOSE 3306

# Start MySQL
CMD ["mysqld"]

