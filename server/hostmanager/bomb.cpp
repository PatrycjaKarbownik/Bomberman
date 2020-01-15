#include "bomb.h"

Bomb::Bomb(qint32 id_, Player *owner_, const qint32 explosionTimeout, QObject *parent)
    : QObject(parent),
      m_owner(owner_),
      m_id(id_)
{
    connect(&m_explosionTimer, &QTimer::timeout, this, &Bomb::onExplosionTimeout);
    m_explosionTimer.setSingleShot(true);
    m_explosionTimer.start(explosionTimeout);

}

void Bomb::stopCountdown()
{
    m_explosionTimer.stop();
}

double Bomb::posX() const
{
    return m_posX;
}

void Bomb::setPosX(double posX)
{
    m_posX = posX;
}

double Bomb::posY() const
{
    return m_posY;
}

void Bomb::setPosY(double posY)
{
    m_posY = posY;
}

qint32 Bomb::id() const
{
    return m_id;
}

Player *Bomb::owner() const
{
    return m_owner;
}

qint32 Bomb::range() const
{
    return m_range;
}

void Bomb::setRange(const qint32 &range)
{
    m_range = range;
}

void Bomb::onExplosionTimeout()
{
    emit exploded(this);
}
