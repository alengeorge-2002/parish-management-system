#!/bin/sh
set -e

IMG=/mnt/host/d/College/ParishManagement/backend/db/pgdata.ext4
MOUNTPOINT=/mnt/pgdata
PGDATA=$MOUNTPOINT/data

mkdir -p $MOUNTPOINT
if ! mountpoint -q $MOUNTPOINT; then
  mount -o loop $IMG $MOUNTPOINT
fi

mkdir -p $PGDATA /run/postgresql
chown -R postgres:postgres $MOUNTPOINT /run/postgresql
chmod 700 $PGDATA

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  su -s /bin/sh postgres -c "initdb -D $PGDATA -E utf8"
  echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
  echo "host all all 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"
  echo "host all all ::0/0 trust" >> "$PGDATA/pg_hba.conf"
fi

# If postmaster.pid exists but process is not running, remove stale pid file
if [ -f "$PGDATA/postmaster.pid" ]; then
  PID=$(head -n 1 "$PGDATA/postmaster.pid")
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "Removing stale postmaster.pid (PID $PID)"
    rm -f "$PGDATA/postmaster.pid"
  fi
fi

# Start postgres in foreground or background based on argument
if [ "$1" = "foreground" ]; then
  exec su -s /bin/sh postgres -c "postgres -D $PGDATA"
else
  su -s /bin/sh postgres -c "pg_ctl status -D $PGDATA" || su -s /bin/sh postgres -c "pg_ctl start -D $PGDATA -l /mnt/pgdata/pglogfile"
  sleep 2
  su -s /bin/sh postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD 'postgres';\"" || su -s /bin/sh postgres -c "psql -c \"CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';\"" || true
  su -s /bin/sh postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname = 'devagiri_parish_db'\"" | grep -q 1 || su -s /bin/sh postgres -c "createdb -O postgres devagiri_parish_db" || true
  echo "PostgreSQL setup completed successfully."
fi
